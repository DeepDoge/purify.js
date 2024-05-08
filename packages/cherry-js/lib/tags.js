/**
 * @template {ParentNode} TParentNode
 * @typedef ChildNodeOf
 * @type {DocumentFragment | CharacterData | (TParentNode extends SVGElement ? SVGElement : TParentNode extends HTMLElement ? Element : TParentNode extends MathMLElement ? MathMLElement : Element)}
 */

import { toAppendable } from "./element"

/**
 * @template {ParentNode} T
 * @typedef MemberOf
 * @type {string | number | boolean | bigint | null | ChildNodeOf<T> | import("./signals/core").Signal<any>}
 */

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
 * @template {ParentNode} T
 * @typedef Builder
 * @type {[
 *      T extends Element
 *          ?   (...args: [children?: MemberOf<T>[]] | [props?: Partial<ARIAMixin> & Directives.On<T>, children?: MemberOf<T>[]]) => T
 *          : (children?: MemberOf<T>[]) => T
 * ][number]}
 */

/**
 * @type {*}
 */
const anyObj = {}

/**
 * @type {{
 *    [K in keyof HTMLElementTagNameMap]: Builder<HTMLElementTagNameMap[K]>
 * }}
 */
export const tags = new Proxy(anyObj, {
    /**
     *
     * @param {never} _
     * @param {keyof HTMLElementTagNameMap} tag
     * @returns
     */
    get(_, tag) {
        /**
         * @type {Builder<Element>}
         */
        return (props, children) => {
            const element = document.createElement(tag)
            if (props) {
                for (const [key, value] of Object.entries(props)) {
                    if (key.startsWith("on:")) {
                        element.addEventListener(key.slice(3), value)
                    } else {
                        element.setAttribute(key, value)
                    }
                }
            }
            if (children) {
                element.append(...children.map(toAppendable))
            }
            return element
        }
    },
})
