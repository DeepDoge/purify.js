import type { Signal, SignalOrValueOrFn } from "./core"
import type { Utils } from "./utils"

/* 
        TODO:  
                    DONE: Re:think this, probably rename it to Props, so Props can be a union of Directives and Attributes
                            Make it easier to maintain
                            Also don't allow invalid directives such as bind:foo, this should give an error
                            It shouldnt fallback to attributes.
                            Also we should auto complete directives that are not literal strings, using "" 

        Later might change the whole idea, and make everything towards making html strings and parsing it later.
        Or similar.

        Also we only truely support HTML XML only, we should Elements in general.
        Also if we can separate parsing and genereting the xml string, it might be better. maybe.
        especially if we wanna add ssr later with a meta framework with hydration or something similar to resumability.

        in short everything can change later, but for now this is good enough for now for making the eternis app. which will be on IPFS so has to be SPA.

        later we can do the changes and migrate the eternis to it.
        if all works well, we will release 0.1.0
    */

export namespace Template {
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
        | readonly MemberOf<Extract<ChildNodeOf<T>, ParentNode>>[]
        | readonly Exclude<ChildNodeOf<T>, ParentNode>[]
        | (() => MemberOf<Extract<ChildNodeOf<T>, ParentNode>>)
        | (() => Exclude<ChildNodeOf<T>, ParentNode>)
        | Signal<MemberOf<Extract<ChildNodeOf<T>, ParentNode>>>
        | Signal<Exclude<ChildNodeOf<T>, ParentNode>>

    export type Builder<T extends ParentNode> = T extends Element
        ? {
              <
                  const TProps extends Props<T>,
                  const TChildren extends readonly MemberOf<T>[],
              >(
                  ...args:
                      | [props?: VerifyPropsGeneric<T, TProps>, children?: TChildren]
                      | [children?: TChildren]
              ): T
          }
        : {
              <const TChildren extends readonly MemberOf<T>[]>(children?: TChildren): T
          }

    export type VerifyPropsGeneric<E extends Element, T extends Props<E>> = T &
        (Exclude<
            Extract<keyof Utils.OmitNonLiteral<T>, `${string}:${string}`>,
            keyof Utils.OmitNonLiteral<Directives<E>>
        > extends never
            ? {}
            : `Error: Invalid directive, ${Exclude<
                  Extract<keyof Utils.OmitNonLiteral<T>, `${string}:${string}`>,
                  keyof Utils.OmitNonLiteral<Directives<E>>
              >}`)

    type ExtractPossibleAttributes<T extends Element> = Utils.WritablePart<{
        [K in keyof T as Exclude<T[K], string | boolean> extends never
            ? K extends string
                ? string extends K
                    ? never
                    : K extends Lowercase<K>
                      ? Utils.KebabCase<K>
                      : never
                : never
            : never]?: NonNullable<T[K] extends boolean ? "true" | "" : T[K]> | null
    }>

    export type ARIAAttributes = {
        [K in keyof ARIAMixin as Utils.KebabCase<K>]?: NonNullable<ARIAMixin[K]> | null
    }

    export type Attributes<T extends Element> = {
        [K in `data-` | string]?: unknown
    } & ExtractPossibleAttributes<T> &
        (T extends { className: string | null } ? { class?: string } : {}) &
        ARIAAttributes

    export type Styles<T extends ElementCSSInlineStyle> = Omit<
        {
            [K in keyof T["style"] as K extends string
                ? string extends K
                    ? never
                    : T["style"][K] extends string | null
                      ? Utils.KebabCase<K>
                      : never
                : never]: T["style"][K] | null
        },
        `webkit-${string}`
    > & {
        [unknown: string]: string | null
    }

    export type EventMap<T extends Element> = T extends HTMLElement
        ? HTMLElementEventMap
        : T extends SVGElement
          ? SVGElementEventMap
          : T extends MathMLElement
            ? MathMLElementEventMap
            : ElementEventMap

    export type ValueKey<
        T extends string | null | undefined = keyof InputTypeToValueKeyMap,
    > =
        | (T extends keyof InputTypeToValueKeyMap ? InputTypeToValueKeyMap[T] : never)
        | "value"
    export type InputTypeToValueKeyMap = {
        radio: "checked"
        checkbox: "checked"
        range: "valueAsNumber"
        number: "valueAsNumber"
        date: "valueAsDate"
        "datetime-local": "valueAsDate"
        month: "valueAsDate"
        time: "valueAsDate"
        week: "valueAsDate"
        file: "files"
        text: "value"
        color: "value"
        email: "value"
        password: "value"
        search: "value"
        tel: "value"
        url: "value"
    }

    export type Directives<T extends Element> = Readonly<
        Partial<
            { [K in `on:`]: never } & {
                [K in `on:${string}`]: { (event: Event & { target: T }): void } | Function
            } & {
                [K in keyof EventMap<T> as K extends string ? `on:${K}` : never]:
                    | {
                          (event: EventMap<T>[K] & { target: T }): void
                      }
                    | Function
            } & (T extends ElementCSSInlineStyle
                    ? {
                          [K in `style:`]: never
                      } & {
                          [K in `style:${string}`]: SignalOrValueOrFn<string | null>
                      } & {
                          [K in keyof Styles<T> as K extends string
                              ? `style:${K}`
                              : never]: SignalOrValueOrFn<string | null>
                      }
                    : {}) &
                (T extends { type: infer TType extends string; value: string | null }
                    ? {
                          [K in ValueKey<TType> as K extends string
                              ? `bind:${K}`
                              : never]: K extends keyof T
                              ? Signal.Mut<T[K] | null>
                              : never
                      }
                    : {}) &
                (T extends { className: string | null }
                    ? { [K in `class:`]: never } & {
                          [K in `class:${string}`]: SignalOrValueOrFn<boolean | {}>
                      }
                    : {})
        >
    >

    export type Props<T extends Element> = Readonly<
        {
            [K in keyof Attributes<T>]?: SignalOrValueOrFn<Attributes<T>[K]>
        } & Directives<T>
    >
}
