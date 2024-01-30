export namespace Utils {
    export type AsciiLetter =
        | "a"
        | "b"
        | "c"
        | "d"
        | "e"
        | "f"
        | "g"
        | "h"
        | "i"
        | "j"
        | "l"
        | "m"
        | "n"
        | "o"
        | "p"
        | "q"
        | "r"
        | "s"
        | "u"
        | "v"
        | "w"
        | "x"
        | "y"
        | "z"

    export type KebabCase<
        T extends string,
        A extends string = "",
    > = T extends `${infer F}${infer R}`
        ? KebabCase<R, `${A}${F extends Lowercase<F> ? "" : "-"}${Lowercase<F>}`>
        : A

    export type CanDecide<T, U> = boolean extends (T extends U ? true : false)
        ? false
        : true

    export type EmptyObject = { [key: string]: never }

    type BuildTuple<L extends number, T extends any[] = []> = T extends {
        length: L
    }
        ? T
        : BuildTuple<L, [...T, unknown]>

    export type Subtract<A extends number, B extends number> = A extends number
        ? B extends number
            ? BuildTuple<A> extends [...infer U, ...BuildTuple<B>]
                ? U["length"]
                : never
            : never
        : never

    type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
        k: infer I,
    ) => void
        ? I
        : never
    type LastOf<T> =
        UnionToIntersection<T extends any ? () => T : never> extends () => infer R
            ? R
            : never

    type Push<T extends any[], V> = [...T, V]

    export type TuplifyUnion<
        T,
        L = LastOf<T>,
        N = [T] extends [never] ? true : false,
    > = true extends N ? [] : Push<TuplifyUnion<Exclude<T, L>>, L>

    export type LiteralKeys<T> = keyof {
        [K in keyof T as K extends `${infer A}${infer B}` ? K : never]: T[K]
    }
    export type PickLiteralKeys<T> = Pick<
        T,
        LiteralKeys<T> extends keyof T ? LiteralKeys<T> : never
    >

    declare const ERROR: unique symbol
    type ERROR = typeof ERROR
    export type ErrorType<Message extends string> = { [ERROR]: Message }

    declare const BRAND: unique symbol
    type BRAND = typeof BRAND
    export type Brand<Name extends string, Type> = Type &
        (Type extends { [BRAND]: string }
            ? { [BRAND]: Type[BRAND] | Name }
            : { [BRAND]: Name })

    export type Equals<T, U> =
        (<G>() => G extends T ? 1 : 0) extends <G>() => G extends U ? 1 : 0 ? true : false
    export type NotEquals<T, U> = Equals<T, U> extends true ? false : true

    export type MutableKeysOf<T> = {
        [P in keyof T]: Equals<
            { [Q in P]: T[P] },
            { -readonly [Q in P]: T[P] }
        > extends true
            ? P
            : never
    }[keyof T]
    export type PickMutable<T> = Pick<T, MutableKeysOf<T>>

    export type DeepOptional<T> = T extends object
        ? { [K in keyof T]?: DeepOptional<T[K]> }
        : T

    export type ValueGuard<T> = (value: any) => value is T
    export type ValueGuardType<T extends ValueGuard<any>> =
        T extends ValueGuard<infer R> ? R : never

    export type Narrow<TValue, TGuardType> = TValue &
        (Extract<TGuardType, TValue> extends never
            ? Extract<TValue, TGuardType> extends never
                ? never
                : Extract<TValue, TGuardType>
            : Extract<TGuardType, TValue>)

    export type Pretty<T> = {
        [K in keyof T]: T[K]
    }

    export type ValueOf<T> = T extends Object ? ReturnType<T["valueOf"]> : never

    export type IsReferenceType<T> = Equals<ValueOf<T>, Object>
    export type Fn = (...args: any[]) => any

    export type NoNever<T> = T extends Fn
        ? T
        : IsReferenceType<T> extends false
          ? T
          : NonNullable<
                  { [K in keyof T]: [T[K]] extends [never] ? 0 : 1 }[keyof T]
              > extends 1
            ? T
            : never
}
