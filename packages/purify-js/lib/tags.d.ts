import { Signal } from "./signals"
import { IsFunction, IsReadonly, NotEventHandler } from "./utils"

export function fragment(...members: MemberOf<DocumentFragment>[]): DocumentFragment

export type Enhanced<T extends HTMLElement = HTMLElement> = T & {
    onConnect(callback: Enhanced.ConnectedCallback): void
}
export namespace Enhanced {
    type DisconnectedCallback = () => void
    type ConnectedCallback = () => void | DisconnectedCallback
}

export type Tags = {
    [K in keyof HTMLElementTagNameMap]: (attributes?: {
        [name: string]: Builder.AttributeValue<Enhanced<HTMLElementTagNameMap[K]>>
    }) => Builder.Proxy<Enhanced<HTMLElementTagNameMap[K]>>
}
export const tags: Tags

export class Builder<T extends Element> {
    constructor(element: T)
    element: T
    children(...members: MemberOf<T>[]): this
    attributes(attributes: Record<string, Builder.AttributeValue<T>>): this
}
export namespace Builder {
    type AttributeValue<T extends Element> =
        | string
        | number
        | boolean
        | bigint
        | null
        | (T extends Enhanced ? Signal<AttributeValue<T>> : never)

    function Proxy<T extends Element>(element: T): Builder.Proxy<T>
    type Proxy<T extends Element> = Builder<T> & {
        [K in keyof T as true extends
        | IsReadonly<T, K>
        | (IsFunction<T[K]> & NotEventHandler<T, K>)
        ? never
        : K]: (
            value: NonNullable<T[K]> extends (this: infer X, event: infer U) => infer R
                ? U extends Event
                ? (this: X, event: U & { currentTarget: T }) => R
                : T[K]
                : T extends Enhanced ? (T[K] | Signal<T[K]>) : T[K]
        ) => Proxy<T>
    }
}

export type ChildNodeOf<TParentNode extends ParentNode> =
    | DocumentFragment
    | CharacterData
    | (TParentNode extends SVGElement
        ? TParentNode extends SVGForeignObjectElement
        ? Element
        : SVGElement
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
    | (HTMLElement extends ChildNodeOf<T> ? Builder<Enhanced> : never)
    | MemberOf<T>[]
    | Signal<MemberOf<T>>
