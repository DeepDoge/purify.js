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
let toAppendable = (value) => {
    if (value == null) {
        return ""
    }

    if (instancesOf(value, Element, DocumentFragment, CharacterData)) {
        return value
    }

    if (instancesOf(value, Signal)) {
        let wrapper = enchance("div")
        wrapper.style.display = "contents"
        wrapper.onConnect(() =>
            value.follow((value) => wrapper.replaceChildren(toAppendable(value)), true),
        )
        return wrapper
    }

    if (instancesOf(value, Builder)) {
        return value.element
    }

    if (Array.isArray(value)) {
        return fragment(...value.map(toAppendable))
    }

    return String(value)
}

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
    newTagName = `enchance-${tagname}`,
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
                /** @type {Set<import("./tags.js").Enhanced.ConnectedCallback>} */
                #connectedCallbacks = new Set()
                /** @type {Set<import("./tags.js").Enhanced.DisconnectedCallback>} */
                #disconnectedCallbacks = new Set()

                connectedCallback() {
                    for (let callback of this.#connectedCallbacks) {
                        let disconnectedCallback = callback()
                        if (disconnectedCallback)
                            this.#disconnectedCallbacks.add(disconnectedCallback)
                    }
                }

                disconnectedCallback() {
                    for (let callback of this.#disconnectedCallbacks) {
                        callback()
                    }
                }

                /**
                 * @param {import("./tags.js").Enhanced.ConnectedCallback} connectedCallback
                 */
                onConnect = (connectedCallback) => {
                    this.#connectedCallbacks.add(connectedCallback)
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
             * @template {keyof HTMLElementTagNameMap} T
             * @param {never} _
             * @param {T} tag
             * @returns
             */
            get:
                (_, tag) =>
                /**
                 * @param {Record<string, import("./tags.js").Builder.AttributeValue>} attributes
                 * @param {*} element
                 */
                (attributes = {}, element = enchance(tag)) =>
                    new Proxy(new Builder(element, attributes), {
                        /** @param {*} target */
                        get: (target, name, proxy) =>
                            target[name] ??
                            (name in element &&
                                ((/** @type {unknown} */ value) => {
                                    if (instancesOf(value, Signal)) {
                                        element.onConnect(() =>
                                            value.follow((value) => {
                                                element[name] = value
                                            }),
                                        )
                                    } else {
                                        element[name] = value
                                    }

                                    return proxy
                                })),
                    }),
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
            let setOrRemoveAttribute = (value) => {
                if (value == null) {
                    element.removeAttribute(name)
                } else {
                    element.setAttribute(name, String(value))
                }
            }

            if (instancesOf(value, Signal)) {
                element.onConnect(() => value.follow(setOrRemoveAttribute, true))
            } else {
                setOrRemoveAttribute(value)
            }
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
