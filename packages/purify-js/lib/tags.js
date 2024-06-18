import { Signal } from "./signals.js"

/**
 * @template {(abstract new (...args: any[]) => any)[]} T
 * @param {T} constructors
 * @param {unknown} target
 * @returns {target is T[number] extends abstract new (...args: any[]) => infer U ? U : never}
 */
let instancesOf = (target, ...constructors) =>
    constructors.some((constructor) => target instanceof constructor)

/** @param {import("./tags.js").MemberOf<DocumentFragment>[]} members */
export let fragment = (...members) => {
    let fragment = document.createDocumentFragment()
    if (members) fragment.append(...members.map(toAppendable))
    return fragment
}

/**
 * @param {unknown} value
 * @returns {string | CharacterData | Element | DocumentFragment}
 */
let toAppendable = (value) =>
    value == null
        ? ""
        : instancesOf(value, Element, DocumentFragment, CharacterData)
          ? value
          : instancesOf(value, Signal)
            ? ((wrapper = enchance("div")) => (
                  (wrapper.style.display = "contents"),
                  wrapper.onConnect(() =>
                      value.follow(
                          (value) => wrapper.replaceChildren(toAppendable(value)),
                          true,
                      ),
                  ),
                  wrapper
              ))()
            : instancesOf(value, Builder)
              ? value.element
              : Array.isArray(value)
                ? fragment(...value.map(toAppendable))
                : String(value)

/**
 * @template {keyof HTMLElementTagNameMap | (string & {})} T
 * @param {T} tagname
 * @returns {import("./tags.js").Enhanced<HTMLElementTagNameMap[T extends keyof HTMLElementTagNameMap ?
 *      HTMLElementTagNameMap[T] :
 *      HTMLElement
 * ]>}
 */
let enchance = (
    tagname,
    newTagName = `x-${tagname}`,
    custom = customElements,
    constructor = custom.get(newTagName),
) => {
    if (!constructor) {
        custom.define(
            newTagName,
            (constructor = class
                extends /** @type {typeof HTMLElement} */ (
                    (/** @type {unknown} */ (document.createElement(tagname).constructor))
                )
            {
                /** @type {import("./tags.js").Enhanced.ConnectedCallback=} */
                #connected
                /** @type {import("./tags.js").Enhanced.DisconnectedCallback=} */
                #disconnected

                connectedCallback() {
                    this.#connected?.()
                }

                disconnectedCallback() {
                    this.#disconnected?.()
                }

                /**
                 * @param {import("./tags.js").Enhanced.ConnectedCallback} connectedCallback
                 */
                onConnect = (
                    connectedCallback,
                    self = this,
                    connectedStack = self.#connected,
                    connected = (
                        disconnectedCallback = connectedCallback(),
                        disconnectedStack = self.#disconnected,
                    ) => {
                        self.#disconnected = () => {
                            disconnectedStack?.()
                            disconnectedCallback?.()
                        }
                    },
                ) => {
                    self.#connected = () => {
                        connectedStack?.()
                        connected()
                    }
                    if (self.isConnected) {
                        connected()
                    }
                }
            }),
            { extends: tagname },
        )
    }

    return /** @type {never} */ (new constructor())
}

export let tags = /** @type {import("./tags.js").Tags} */ (
    new Proxy(
        {},
        {
            /**
             *
             * @param {*} _
             * @param {*} tag
             * @returns
             */
            get:
                (_, tag) =>
                /**
                 * @param {*} attributes
                 * @param {*} element
                 */
                (
                    attributes = {},
                    element = enchance(tag),
                    proxy = new Proxy(new Builder(element, attributes), {
                        get: (target, name) =>
                            /** @type {*} */ (target)[name] ??
                            (name in element &&
                                ((/** @type {*} */ value) => (
                                    instancesOf(value, Signal)
                                        ? element.onConnect(() =>
                                              value.follow(
                                                  (value) => (element[name] = value),
                                              ),
                                          )
                                        : (element[name] = value),
                                    proxy
                                ))),
                    }),
                ) =>
                    proxy,
        },
    )
)

/**
 * @template {import("./tags.js").Enhanced<HTMLElement>} T
 */
export class Builder {
    /** @type {T} */
    element

    /**
     * @param {T} element
     * @param {{ [name: string]: import('./tags.js').Builder.AttributeValue | Signal<import('./tags.js').Builder.AttributeValue> }} attributes
     */
    constructor(element, attributes = {}) {
        this.element = element
        for (let name in attributes) {
            let value = attributes[name]
            /** @param {unknown} value */
            let setOrRemoveAttribute = (value) =>
                value == null
                    ? element.removeAttribute(name)
                    : element.setAttribute(name, String(value))

            instancesOf(value, Signal)
                ? element.onConnect(() => value.follow(setOrRemoveAttribute, true))
                : setOrRemoveAttribute(value)
        }
    }

    /**
     * @param {import("./tags.js").MemberOf<T>[]} members
     */
    children(...members) {
        let element = this.element
        element.append(...members.map(toAppendable))
        return this
    }
}
