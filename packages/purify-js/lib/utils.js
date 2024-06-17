/**
 * @template X
 * @template Y
 * @template [A = X]
 * @template [B = never]
 * @typedef IfEquals
 * @type {(
 *   (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? A : B
 * )}
 */

/**
 * @template T
 * @template {keyof T} K
 * @typedef IsReadonly
 * @type {IfEquals<
 *   { [Q in K]: T[K] },
 *   { readonly [Q in K]: T[K] },
 *   true,
 *   false
 * >}
 */

/**
 * @template T
 * @typedef IsFunction
 * @type {T extends Fn ? true : false}
 */

/**
 * @typedef Fn
 * @type {(...args: *[]) => *}
 */

/**
 * @template T
 * @typedef NotEventHandler
 * @type {NonNullable<T> extends (this: any, event: infer U) => any ? U extends Event ? false : true : true}
 */

export {}
