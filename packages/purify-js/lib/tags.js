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
 * @template {keyof HTMLElementTagNameMap} T
 * @param {T} tagname
 * @returns {import("./tags.js").Enhanced<HTMLElementTagNameMap[T]>}
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
                 * @param {Record<string, import("./tags.js").Builder.AttributeValue<import("./tags.js").Enhanced<HTMLElementTagNameMap[T]>>>} attributes
                 */
                (attributes = {}) =>
                    Builder.Proxy(enchance(tag)).attributes(attributes),
        },
    )
)

/**
 * @template {Element} T
 */
export class Builder {
    /**
     * @template {Element} T
     * @param {T} element
     * @returns {import("./tags.js").Builder.Proxy<T>}
     */
    static Proxy = (element) =>
        new Proxy(new Builder(element), {
            /** @param {*} target */
            get: (target, name, proxy) =>
                target[name] ??
                (name in element &&
                    ((/** @type {unknown} */ value) => {
                        if (instancesOf(value, Signal)) {
                            // @ts-ignore
                            element.onConnect(() =>
                                value.follow((value) => {
                                    // @ts-ignore
                                    element[name] = value
                                }),
                            )
                        } else {
                            // @ts-ignore
                            element[name] = value
                        }

                        return proxy
                    })),
        })

    /** @type {T} */
    element

    /**
     * @param {T} element
     */
    constructor(element) {
        this.element = element
    }

    /* 
        Since we access buildier from, BuilderProxy
        Make sure to only use and override names that already exist in HTMLElement(s)
        We don't wanna conflict with something that might come in the future.
    */

    /**
     * @param {import("./tags.js").MemberOf<T>[]} members
     */
    children(...members) {
        let element = this.element
        element.append(...members.map(toAppendable))
        return this
    }

    /**
     * @param {{ [name: string]: import('./tags.js').Builder.AttributeValue<T> }} attributes
     */
    attributes(attributes) {
        let element = this.element
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
                // @ts-ignore
                element.onConnect(() => value.follow(setOrRemoveAttribute, true))
            } else {
                setOrRemoveAttribute(value)
            }
        }
        return this
    }
}
