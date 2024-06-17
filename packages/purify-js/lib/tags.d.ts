import { Signal } from "./signals"
import { IfEquals, IsFunction, NotEventHandler } from "./utils"

export function fragment(...members: MemberOf<DocumentFragment>[]): DocumentFragment

export function toAppendable(
    value: unknown,
): string | CharacterData | Element | DocumentFragment

export class SignalElement extends HTMLElement {
    constructor(signal: Signal)
    $signal: Signal
    $unfollow: Signal.Unfollower | undefined
    connectedCallback(self?: this): void
    disconnectedCallback(): void
}

export type Tags = {
    [K in keyof HTMLElementTagNameMap]: (attributes?: {
        [name: string]: Builder.AttributeValue | Signal<Builder.AttributeValue>
    }) => Builder<HTMLElementTagNameMap[K]> & ToBuilderFunctions<HTMLElementTagNameMap[K]>
}
export const tags: Tags

export class Builder<T extends Element & ParentNode> {
    constructor(
        element: T,
        attributes?: {
            [name: string]: Builder.AttributeValue | Signal<Builder.AttributeValue>
        },
    )
    element: T
    children(...members: MemberOf<T>[]): this
}
export namespace Builder {
    type AttributeValue = string | number | boolean | bigint | null
}

export type ChildNodeOf<TParentNode extends ParentNode> =
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
    | Builder<Extract<ChildNodeOf<T>, Element>>
    | MemberOf<T>[]
    | Signal<MemberOf<T>>

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
