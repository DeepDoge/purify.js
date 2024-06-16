import { Signal } from "./signals"
import { IfEquals, IsFunction, NotEventHandler } from "./utils"

export function fragment(
    ...members: import("./tags").MemberOf<DocumentFragment>[]
): DocumentFragment

export function toAppendable(
    value: unknown,
): string | CharacterData | Element | DocumentFragment

export class SignalElement extends HTMLElement {
    constructor(signal: typeof this.$signal)
    $signal: Signal<any>
    $unfollow: import("./signals").Signal.Unfollower | undefined
    connectedCallback(self?: this): void
    disconnectedCallback(): void
}

export const tags: {
    [K in keyof HTMLElementTagNameMap]: (attributes?: {
        [name: string]: string | number | boolean | bigint | null
    }) => Builder<HTMLElementTagNameMap[K]> & ToBuilderFunctions<HTMLElementTagNameMap[K]>
}

export class Builder<T extends Element & ParentNode> {
    constructor(
        element: T,
        attributes?: {
            [name: string]: string | number | boolean | bigint | null
        },
    )
    element: T
    constructor(
        element: T,
        attributes?: {
            [name: string]: string | number | boolean | bigint | null
        },
    )
    children(...members: MemberOf<T>[]): this
}

export type ChildNodeOf<TParentNode extends ParentNode> =
    | any
    | DocumentFragment
    | CharacterData
    | (TParentNode extends SVGElement
          ? SVGElement
          : TParentNode extends HTMLElement
            ? Element
            : TParentNode extends MathMLElement
              ? MathMLElement
              : Element)

export type MemberOf<T extends ParentNode> =
    | string
    | number
    | boolean
    | bigint
    | null
    | ChildNodeOf<T>
    | Builder<any>
    | import("./signals").Signal<any>

export type EventMap<T extends Element> = T extends HTMLElement
    ? HTMLElementEventMap
    : T extends SVGElement
      ? SVGElementEventMap
      : T extends MathMLElement
        ? MathMLElementEventMap
        : ElementEventMap

export type ToBuilderFunctions<T extends Element> = {
    [K in keyof T as true extends
        | IfEquals<{ [Q in K]: T[K] }, { readonly [Q_1 in K]: T[K] }, true, false>
        | (IsFunction<T[K]> & NotEventHandler<T[K]>)
        ? never
        : K]: (
        value: NonNullable<T[K]> extends (this: infer X, event: infer U) => infer R
            ? U extends Event
                ? (
                      this: X,
                      event: U & {
                          currentTarget: T
                      },
                  ) => R
                : T[K]
            : T[K],
    ) => Builder<T> & ToBuilderFunctions<T>
}
