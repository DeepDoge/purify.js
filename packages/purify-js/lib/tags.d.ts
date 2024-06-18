import { Signal } from "./signals"
import { IsFunction, IsReadonly, NotEventHandler } from "./utils"

export function fragment(...members: MemberOf<DocumentFragment>[]): DocumentFragment

export function toAppendable(
    value: unknown,
): string | CharacterData | Element | DocumentFragment

export interface Enhanced<T extends HTMLElement> extends HTMLElement {
    onConnect(callback: Enhanced.ConnectedCallback): void
}
export namespace Enhanced {
    type DisconnectedCallback = () => void
    type ConnectedCallback = () => void | DisconnectedCallback
}

export type Tags = {
    [K in keyof HTMLElementTagNameMap]: (attributes?: {
        [name: string]: Builder.AttributeValue | Signal<Builder.AttributeValue>
    }) => BuilderProxy<Enhanced<HTMLElementTagNameMap[K]>>
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

type BuilderProxy<T extends Enhanced<HTMLElement>> = Builder<T> & {
    [K in keyof T as true extends
        | IsReadonly<T, K>
        | (IsFunction<T[K]> & NotEventHandler<T[K]>)
        ? never
        : K]: (
        value: NonNullable<T[K]> extends (this: infer X, event: infer U) => infer R
            ? U extends Event
                ? (this: X, event: U & { currentTarget: T }) => R
                : T[K]
            : T[K] | Signal<T[K]>,
    ) => BuilderProxy<T>
}
