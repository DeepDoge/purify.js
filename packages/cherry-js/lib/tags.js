import { Signal } from "./signals"

/**
 * @param {import("./tags").MemberOf<DocumentFragment>[]} members
 */
export const fragment = (...members) => {
    let fragment = document.createDocumentFragment()
    members && fragment.append(...members.map(toAppendable))
    return fragment
}

/**
 * @template {ParentNode} TParentNode
 * @typedef ChildNodeOf
 * @type {
 * | DocumentFragment
 * | CharacterData
 * | (
 *      TParentNode extends SVGElement ?
 *          SVGElement :
 *      TParentNode extends HTMLElement ?
 *          Element :
 *      TParentNode extends MathMLElement ?
 *          MathMLElement :
 *          Element
 *  )}
 */

/**
 * @template {ParentNode} T
 * @typedef MemberOf
 * @type {string | number | boolean | bigint | null | ChildNodeOf<T> | Builder<*> | import("./signals").Signal<*>}
 */

/**
 * @param {unknown} value
 * @returns {string | CharacterData | Element | DocumentFragment}
 */
export function toAppendable(value) {
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

    /** @type {import('./signals').Signal.Unfollower | undefined} */
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

/**
 *
 * @template {Element} T
 * @typedef EventMap
 * @type {T extends HTMLElement ? HTMLElementEventMap :
 *          T extends SVGElement ? SVGElementEventMap :
 *          T extends MathMLElement ? MathMLElementEventMap :
 *          ElementEventMap
 * }
 */

/**
 * @template {Element} T
 * @typedef Directives.On
 * @type {[
 *      | { [K in `on:`]?: never }
 *      | { [K in `on:${any}${any}`]?: K extends `on:${infer N}` ? N extends keyof EventMap<T> ? { (event: EventMap<T>[N] & { currentTarget: T }): unknown } : { (event: Event & { currentTarget: T }): unknown } : never }
 * ][number]}
 */

/**
 * @type {{
 *    [K in keyof HTMLElementTagNameMap]: () => Builder<HTMLElementTagNameMap[K]>
 * }}
 */
export const tags = /** @type {*} */ (
    new Proxy(
        {},
        {
            /**
             *
             * @param {never} _
             * @param {keyof HTMLElementTagNameMap} tag
             * @returns
             */
            get: (_, tag) => () => new Builder(document.createElement(tag)),
        },
    )
)

/**
 * @template {Element & ParentNode} T
 */
export class Builder {
    /** @type {T} */
    element

    /** @param {T} element */
    constructor(element) {
        this.element = element
    }

    /** @param {MemberOf<T>[]} members */
    children(...members) {
        let element = this.element
        element.append(...members.map(toAppendable))
        return this
    }

    /**
     * @param {{ [name: string]: string | number | boolean | bigint | null }} attrs
     */
    attr(attrs) {
        for (const [name, value] of Object.entries(attrs)) {
            this.element.setAttribute(name, String(value))
        }
        return this
    }

    /**
     * @template {keyof EventMap<T>} TEventName
     * @param {TEventName} name
     * @param {(event: EventMap<T>[TEventName] & { currentTarget: T}) => unknown} listener
     */
    on(name, listener) {
        this.element.addEventListener(/** @type {*} */ (name), listener)
        return this
    }
}
