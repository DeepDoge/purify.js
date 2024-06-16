import { Signal } from "./signals"

/**
 * @param {import("./tags.js").MemberOf<DocumentFragment>[]} members
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
 * @type {string | number | boolean | bigint | null | ChildNodeOf<T> | Builder<*> | import("./signals.js").Signal<*>}
 */

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
 * @typedef ToBuilderFunctions
 * @type {{
 *   [K in keyof T as
 *      true extends (
 *          | import("./utils.js").IsReadonly<T, K>
 *          | (import("./utils.js").IsFunction<T[K]> & import("./utils.js").NotEventHandler<T[K]>)
 *      ) ? never : K]:
 *      (
 *          value:
 *              NonNullable<T[K]> extends (this: infer X, event: infer U) => infer R ? U extends Event ?
 *                  (this: X, event: U & { currentTarget: T }) => R
 *              : T[K]
 *              : T[K]
 *      ) => Builder<T> & ToBuilderFunctions<T>
 * }}
 */

/**
 * @type {{
 *    [K in keyof HTMLElementTagNameMap]:
 *       (
 *          attributes?: { [name: string]: string | number | boolean | bigint | null }) =>
 *              Builder<HTMLElementTagNameMap[K]> & ToBuilderFunctions<HTMLElementTagNameMap[K]>
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
     * @param {{ [name: string]: string | number | boolean | bigint | null }} attributes
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

    /** @param {MemberOf<T>[]} members */
    children(...members) {
        let element = this.element
        element.append(...members.map(toAppendable))
        return this
    }
}
