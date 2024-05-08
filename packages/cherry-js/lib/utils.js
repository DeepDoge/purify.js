/**
 * Convert a camel case string to kebab case
 * @template {string} T
 * @template {string} [A=""]
 * @typedef CamelToKebabCase
 * @type {T extends `${infer F}${infer R}` ? CamelToKebabCase<R, `${A}${F extends Lowercase<F> ? "" : "-"}${Lowercase<F>}`> : A}
 */

/**
 * @template {any} T
 * @template {any} U
 * @typedef CanDecide
 * @type {boolean extends (T extends U ? true : false) ? false : true}
 */

/**
 * @typedef EmptyObject
 * @type {{ [key: string]: never }}
 */

/**
 * @template {number} L
 * @template {any[]} [T=[]]
 * @typedef BuildTuple
 * @type {T["length"] extends L ? T : BuildTuple<L, [...T, unknown]>}
 */

/**
 * @template {number} A
 * @template {number} B
 * @typedef Subtract
 * @type {A extends number ? B extends number ? BuildTuple<A> extends [...infer U, ...BuildTuple<B>] ? U["length"] : never : never : never}
 */

/**
 * @template {any} U
 * @typedef UnionToIntersection
 * @type {(U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never}
 */

/**
 * @template {any} T
 * @typedef LastOf
 * @type {UnionToIntersection<T extends any ? () => T : never> extends () => infer R ? R : never}
 */

/**
 * @template {any[]} T
 * @template {any} V
 * @typedef Push
 * @type {[...T, V]}
 */

/**
 * @template {any} T
 * @template {LastOf<T>} [L=LastOf<T>]
 * @template {[T] extends [never] ? true : false} [N=[T] extends [never] ? true : false]
 * @typedef TuplifyUnion
 * @type {true extends N ? [] : Push<TuplifyUnion<Exclude<T, L>>, L>}
 */

/**
 * @template {any} T
 * @typedef LiteralKeys
 * @type {keyof { [K in keyof T as K extends `${infer A}${infer B}` | "" ? K : never]: T[K] }}
 */

/**
 * @template {any} T
 * @typedef PickLiteralKeys
 * @type {Pick<T, LiteralKeys<T> extends keyof T ? LiteralKeys<T> : never>}
 */

const ERROR = Symbol()
/**
 * @typedef ErrorType
 * @type {{ [ERROR]: string }}
 */

const BRAND = Symbol()
/**
 * @template {string} Name
 * @template {any} Type
 * @typedef Brand
 * @type {Type & (Type extends { [BRAND]: string } ? { [BRAND]: Type[BRAND] | Name } : { [BRAND]: Name })}
 */

/**
 * @template {any} T
 * @template {any} U
 * @typedef Equals
 * @type {(<G>() => G extends T ? 1 : 0) extends <G>() => G extends U ? 1 : 0 ? true : false}
 */

/**
 * @template {any} T
 * @template {any} U
 * @typedef NotEquals
 * @type {Equals<T, U> extends true ? false : true}
 */

/**
 * @template {any} T
 * @typedef MutableKeysOf
 * @type {{ [P in keyof T]: Equals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }> extends true ? P : never }[keyof T]}
 */

/**
 * @template {any} T
 * @typedef PickMutable
 * @type {Pick<T, MutableKeysOf<T>>}
 */

/**
 * @template {any} T
 * @typedef DeepOptional
 * @type {T extends object ? { [K in keyof T]?: DeepOptional<T[K]> } : T}
 */

/**
 * @template {any} T
 * @typedef ValueGuard
 * @type {(value: any) => value is T}
 */

/**
 * @template {ValueGuard<any>} T
 * @typedef ValueGuardType
 * @type {T extends ValueGuard<infer R> ? R : never}
 */

/**
 * @template {any} TValue
 * @template {any} TGuardType
 * @typedef Narrow
 * @type {TValue & (Extract<TGuardType, TValue> extends never ? Extract<TValue, TGuardType> extends never ? never : Extract<TValue, TGuardType> : Extract<TGuardType, TValue>)}
 */

/**
 * @template {any} T
 * @typedef Pretty
 * @type {{ [K in keyof T]: T[K] }}
 */

/**
 * @template {any} T
 * @typedef AsType
 * @type {{ [K in keyof T]: T[K] }}
 */

/**
 * @template {any} T
 * @typedef ValueOf
 * @type {T extends Object ? ReturnType<T["valueOf"]> : never}
 */

/**
 * @template {any} T
 * @typedef IsReferenceType
 * @type {Equals<ValueOf<T>, Object>}
 */

/**
 * @typedef Fn
 * @type {(...args: any[]) => any}
 */

/**
 * @template {any} T
 * @typedef NoNever
 * @type {T extends Fn ? T : IsReferenceType<T> extends false ? T : NonNullable<{ [K in keyof T]: [T[K]] extends [never] ? 0 : 1 }[keyof T]> extends 1 ? T : never}
 */
