import { isSignal } from "./signals/core"

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
 * @type {DocumentFragment | CharacterData | (TParentNode extends SVGElement ? SVGElement : TParentNode extends HTMLElement ? Element : TParentNode extends MathMLElement ? MathMLElement : Element)}
 */

/**
 * @template {ParentNode} T
 * @typedef MemberOf
 * @type {string | number | boolean | bigint | null | ChildNodeOf<T> | import("./signals/core").Signal<any>}
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

    if (Array.isArray(value)) {
        return fragment(...value.map(toAppendable))
    }

    if (isSignal(value)) {
        return new CherrySignalElement(value)
    }

    return String(value)
}

export class CherrySignalElement extends HTMLElement {
    /** @type {import('./signals/core').Signal.Mut<unknown>} */
    $signal

    /** @type {import('./signals/core').Signal.Unfollow<unknown> | undefined} */
    $unfollow
    /**
     * @param {typeof this.$signal} signal
     */
    constructor(signal) {
        super()
        this.style.display = "contents"
        this.$signal = signal
    }

    connectedCallback() {
        this.$unfollow = this.$signal.follow((val) => {
            this.replaceChildren(toAppendable(val))
        }, true)
    }

    disconnectedCallback() {
        this.$unfollow?.()
    }
}
customElements.define("cherry-signal", CherrySignalElement)

/**
 *
 * @template {Element} T
 * @typedef EventMap
 * @type {[
 *      GlobalEventHandlersEventMap &
 *          T extends HTMLElement ? HTMLElementEventMap :
 *          T extends SVGElement ? SVGElementEventMap :
 *          T extends MathMLElement ? MathMLElementEventMap :
 *          import("./utils").EmptyObject
 * ][number]}
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
 *    [K in keyof HTMLElementTagNameMap]: () => Populate<HTMLElementTagNameMap[K]>
 * }}
 */
// @ts-ignore
export const tags = new Proxy(
    {},
    {
        /**
         *
         * @param {never} _
         * @param {keyof HTMLElementTagNameMap} tag
         * @returns
         */
        get: (_, tag) => () => populate(document.createElement(tag)),
    },
)

/**
 * @template {ParentNode} T
 * @typedef Populate
 * @type {{
 *     [K in (keyof T) | (keyof typeof defaults)]:
 *          K extends keyof typeof defaults ? typeof defaults[K]:
 *          K extends keyof T ? <V extends T[K]>(value: V) => Populate<T> :
 *          never
 * }}
 */

const defaults = {
    /**
     * @template {Element} T
     * @param {T} element
     * @param {MemberOf<T>[]} members
     * @param {Populate<T>} proxy
     * @returns {T}
     */
    children: (element, proxy, ...members) => (
        element.append(...members.map(toAppendable)), element
    ),

    /**
     * @template {Element} T
     * @param {T} element
     * @param {(element: T) => void} callback
     * @param {Populate<T>} proxy
     * @returns {Populate<T>}
     */
    use: (element, proxy, callback) => (callback(element), proxy),
}

/**
 * @template {ParentNode} T
 * @param {T} element
 * @returns {Populate<T>}
 */
export function populate(element) {
    // @ts-ignore
    const proxy = new Proxy(
        {},
        {
            get:
                (_, name) =>
                // @ts-ignore
                (...args) =>
                    // @ts-ignore
                    defaults[key]
                        ? // @ts-ignore
                          defaults[key](element, proxy, ...args)
                        : // @ts-ignore
                          ((element[name] = value), proxy),
        },
    )
    // @ts-ignore
    return proxy
}
