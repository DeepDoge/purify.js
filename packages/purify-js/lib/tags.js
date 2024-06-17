import { Signal } from "./signals.js"

/** @param {import("./tags.js").MemberOf<DocumentFragment>[]} members */
export const fragment = (...members) => {
    let fragment = document.createDocumentFragment()
    members && fragment.append(...members.map(toAppendable))
    return fragment
}

/**
 * @param {unknown} value
 * @returns {string | CharacterData | Element | DocumentFragment}
 */
export let toAppendable = (value) => {
    if (value === null) {
        return fragment()
    }

    if (
        value instanceof Element ||
        value instanceof DocumentFragment ||
        value instanceof CharacterData
    ) {
        return value
    }

    if (value instanceof Signal) {
        return new SignalElement(value)
    }

    if (value instanceof Builder) {
        return value.element
    }

    if (Array.isArray(value)) {
        return fragment(...value.map(toAppendable))
    }

    return String(value)
}

export class SignalElement extends HTMLElement {
    /** @type {Signal<*>} */
    $signal

    /** @type {import('./signals.js').Signal.Unfollower | undefined} */
    $unfollow
    /**
     * @param {typeof this.$signal} signal
     */
    constructor(signal) {
        super()
        this.style.display = "contents"
        this.$signal = signal
    }

    connectedCallback(self = this) {
        self.$unfollow = self.$signal.follow((value) => {
            self.replaceChildren(toAppendable(value))
        }, true)
    }

    disconnectedCallback() {
        this.$unfollow?.()
    }
}
customElements.define("signal-element", SignalElement)

export const tags = /** @type {import("./tags.js").Tags} */ (
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
                 * @param {*} element
                 */
                (
                    attributes = {},
                    element = document.createElement(tag),
                    proxy = new Proxy(new Builder(element, attributes), {
                        get: (target, name) =>
                            /** @type {*} */ (target)[name] ??
                            ((/** @type {*} */ value) => (
                                (element[name] = value), proxy
                            )),
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
            if (value === null) {
                element.removeAttribute(name)
            } else {
                element.setAttribute(name, String(value))
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
