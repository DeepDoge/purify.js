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
export let toAppendable = (value) => {
    if (value == null) {
        return ""
    }

    if (instancesOf(value, Element, DocumentFragment, CharacterData)) {
        return value
    }

    if (instancesOf(value, Signal)) {
        return new TrackerElement((self) =>
            value.follow((value) => self.replaceChildren(toAppendable(value)), true),
        )
    }

    if (instancesOf(value, Builder)) {
        return value.element
    }

    if (Array.isArray(value)) {
        return fragment(...value.map(toAppendable))
    }

    return String(value)
}

export class TrackerElement extends HTMLElement {
    /** @type {((() => void) | void)=} */
    #disconnected
    /** @type {(element: this) => (() => void) | void} */
    #connected

    /**
     * @param {(element: TrackerElement) => (() => void) | void} onConnected
     */
    constructor(onConnected) {
        super()
        this.style.display = "contents"
        this.#connected = onConnected
    }

    connectedCallback(self = this) {
        self.#disconnected = self.#connected(self)
    }

    disconnectedCallback(self = this) {
        self.#disconnected?.()
    }
}
customElements.define("tracker-element", TrackerElement)

export let tags = /** @type {import("./tags.js").Tags} */ (
    new Proxy(
        {},
        {
            /**
             *
             * @param {never} _
             * @param {keyof HTMLElementTagNameMap} tag
             * @returns
             */
            get:
                (_, tag) =>
                /**
                 * @param {*} attributes
                 * @param {any} element
                 */
                (
                    attributes = {},
                    element = document.createElement(tag),
                    proxy = new Proxy(new Builder(element, attributes), {
                        get: (target, name) =>
                            /** @type {*} */ (target)[name] ??
                            (name in element &&
                                ((/** @type {*} */ value) => {
                                    if (instancesOf(value, Signal)) {
                                        element.append(
                                            new TrackerElement(() =>
                                                value.follow(
                                                    (value) => (element[name] = value),
                                                ),
                                            ),
                                        )
                                    } else {
                                        element[name] = value
                                    }
                                    return proxy
                                })),
                    }),
                ) =>
                    proxy,
        },
    )
)

/**
 * @template {Element & ParentNode} T
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
        for (const [name, value] of Object.entries(attributes)) {
            /** @param {unknown} value */
            let setOrRemoveAttribute = (value) => {
                if (value == null) {
                    element.removeAttribute(name)
                } else {
                    element.setAttribute(name, String(value))
                }
            }
            if (instancesOf(value, Signal)) {
                element.append(
                    new TrackerElement(() => value.follow(setOrRemoveAttribute, true)),
                )
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
