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
 * @type {{
 *    [K in keyof HTMLElementTagNameMap]: () => Pipe<HTMLElementTagNameMap[K]>
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
        get: (_, tag) => () => pipe(document.createElement(tag)),
    },
)

/**
 * @template {ParentNode} T
 * @typedef Pipe
 * @type {{
 *     [K in keyof T | 'render' | 'pipe']:
 *          import("./utils").Equals<K, 'render'> extends true ?
 *              (callback?: (element: T) => MemberOf<T>[]) => T :
 *          import("./utils").Equals<K, 'pipe'> extends true ?
 *              (callback?: (element: T) => void) => Pipe<T> :
 *          K extends keyof T ?
 *              <V extends T[K]>(value: V) => Pipe<T> :
 *          never
 * }}
 */

/**
 * @template {ParentNode} T
 * @param {T} element
 * @returns {Pipe<T>}
 */
export function pipe(element) {
    // @ts-ignore
    const proxy = new Proxy(
        {},
        {
            get(_, name) {
                return name === "render"
                    ? // @ts-ignore
                      (callback) => (
                          callback &&
                              element.append(...callback(element).map(toAppendable)),
                          element
                      )
                    : // @ts-ignore
                      (value) => ((element[name] = value), proxy)
            },
        },
    )
    return proxy
}
