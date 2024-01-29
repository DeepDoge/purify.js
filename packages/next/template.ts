import { CustomElement } from "./custom-element"
import {
    EMPTY_STRING,
    FOLLOW,
    FOLLOW_IMMEDIATE_OPTIONS,
    FOR_EACH,
    ON_CONNECT,
    doc,
    instanceOf,
    isArray,
    startsWith,
} from "./helpers"
import { Signal, SignalLikeOrValue, isSignal } from "./signal"
import { Utils } from "./utils"

export let Tags = new Proxy(
    {},
    {
        get(_, tag: string) {},
    },
) as Tags

let fragment: Tags.Builder<DocumentFragment> = (
    children,
    fragment = doc.createDocumentFragment(),
) => (children && populateNode(fragment, children), fragment)

let SignalElement = CustomElement("xch-signal")
type SignalElement = InstanceType<typeof SignalElement>

let signalAsElement = <T>(signal: Signal<T>): SignalElement => {
    let dom = new SignalElement()
    dom.style.display = "contents"

    dom[ON_CONNECT](
        signal[FOLLOW](
            (value: T) => ((dom.innerHTML = EMPTY_STRING), dom.append(toNode(value))),
            FOLLOW_IMMEDIATE_OPTIONS,
        ),
    )

    return dom
}

let toNode = (value: unknown): CharacterData | Element | DocumentFragment => {
    return value === null
        ? fragment()
        : isArray(value)
          ? fragment(value.map(toNode))
          : instanceOf(value, Element, DocumentFragment, CharacterData)
            ? value
            : isSignal(value)
              ? signalAsElement(value)
              : doc.createTextNode(value + EMPTY_STRING)
}

let bindOrSet = <T>(
    customElement: CustomElement,
    value: Signal<T> | T,
    then: (value: T) => void,
): void =>
    isSignal(value)
        ? customElement[ON_CONNECT](value[FOLLOW](then, FOLLOW_IMMEDIATE_OPTIONS))
        : then(value)

let bindSignalAsValue = <
    T extends CustomElement,
    TKey extends Extract<
        keyof T,
        Tags.InputTypeToValueMap[keyof Tags.InputTypeToValueMap]
    >,
>(
    element: T,
    key: TKey,
    signal: Signal.Mut<T[TKey]>,
) => (
    element.addEventListener(
        "input",
        (event: Event) => (signal.ref = (event.target as T)[key]),
    ), // All new browsers will remove the listeners automatically. So no need to waste code removing it manually here.
    element[ON_CONNECT](
        signal[FOLLOW]((value) => (element[key] = value), FOLLOW_IMMEDIATE_OPTIONS),
    )
)

export let populate = <T extends ParentNode>(
    ...args: [node: T, ...Tags.Builder.Parameters<T>]
) => (isArray(args[1]) ? populateNode(...args) : (populateElement as Function)(...args))

let populateNode = <T extends ParentNode>(node: T, children?: Tags.MemberOf<T>[]) => (
    children && node.appendChild(toNode(children)), node
)
let populateElement = <T extends CustomElement>(
    element: T,
    props?: Tags.Props<T>,
    children?: Tags.MemberOf<T>[],
) => (
    props &&
        Object.keys(props)[FOR_EACH]((key) =>
            startsWith(key, "bind:")
                ? bindSignalAsValue(element, key.slice(5) as never, props[key] as never)
                : startsWith(key, "style:")
                  ? bindOrSet(element, props[key]!, (value) =>
                        element.style?.setProperty(
                            key.slice(6),
                            value === null ? value : value + EMPTY_STRING,
                        ),
                    )
                  : startsWith(key, "class:")
                    ? bindOrSet(element, props[key], (value) =>
                          element.classList.toggle(key.slice(6), !!value),
                      )
                    : startsWith(key, "on:")
                      ? element.addEventListener(
                            key.slice(3),
                            props[key] as EventListener,
                        )
                      : bindOrSet(element, props[key], (value) =>
                            value === null
                                ? element.removeAttribute(key)
                                : element.setAttribute(key, value + EMPTY_STRING),
                        ),
        ),
    populateNode(element, children)
)

export type Tags = {
    [K in keyof HTMLElementTagNameMap]: Tags.Builder<HTMLElementTagNameMap[K]>
} & {
    [tag: string]: Tags.Builder<HTMLElement>
}
export namespace Tags {
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

    export type Builder<T extends ParentNode> = (...args: Builder.Parameters<T>) => T
    export namespace Builder {
        export type Parameters<T extends ParentNode> = T extends CustomElement
            ? [props?: Props<T>, children?: MemberOf<T>[]] | [children?: MemberOf<T>[]]
            : T extends Element
              ?
                    | [props?: Attributes<T>, children?: MemberOf<T>[]]
                    | [children?: MemberOf<T>[]]
              : [children?: MemberOf<T>[]]
    }

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

    export type InputTypeToValueMap = {
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
                [K in `on:${string}`]:
                    | { (event: Event & { currentTarget: T }): void }
                    | Function
            } & {
                [K in keyof EventMap<T> as K extends string ? `on:${K}` : never]:
                    | {
                          (event: EventMap<T>[K] & { currentTarget: T }): void
                      }
                    | Function
            } & (T extends ElementCSSInlineStyle
                    ? {
                          [K in `style:`]: never
                      } & {
                          [K in `style:${string}`]: SignalLikeOrValue<string | null>
                      } & {
                          [K in keyof Styles<T> as K extends string
                              ? `style:${K}`
                              : never]: SignalLikeOrValue<string | null>
                      }
                    : {}) &
                (T extends { type: string; value: string | null }
                    ? {
                          [Type in keyof InputTypeToValueMap]: {
                              type: Type
                          } & {
                              [K in `bind:${InputTypeToValueMap[Type]}`]: SignalLikeOrValue<
                                  T[Extract<InputTypeToValueMap[Type], keyof T>]
                              >
                          }
                      }[keyof InputTypeToValueMap]
                    : {}) &
                (T extends { className: string | null }
                    ? { [K in `class:`]: never } & {
                          [K in `class:${string}`]: SignalLikeOrValue<boolean | {}>
                      }
                    : {})
        >
    >

    export type Attributes<T extends Element> = Readonly<
        {
            [K in string]: unknown
        } & {
            [K in `data-`]: never
        } & {
            [K in `data-`]?: string
        } & {
            role?:
                | "alert"
                | "alertdialog"
                | "application"
                | "article"
                | "banner"
                | "button"
                | "cell"
                | "checkbox"
                | "columnheader"
                | "combobox"
                | "command"
                | "comment"
                | "complementary"
                | "composite"
                | "contentinfo"
                | "definition"
                | "dialog"
                | "directory"
                | "document"
                | "document"
                | "feed"
                | "figure"
                | "form"
                | "generic"
                | "grid"
                | "gridcell"
                | "group"
                | "heading"
                | "img"
                | "input"
                | "landmark"
                | "link"
                | "list"
                | "listbox"
                | "listitem"
                | "log"
                | "main"
                | "mark"
                | "marquee"
                | "math"
                | "menu"
                | "menubar"
                | "menuitem"
                | "menuitemcheckbox"
                | "menuitemradio"
                | "meter"
                | "navigation"
                | "none"
                | "note"
                | "option"
                | "presentation"
                | "progressbar"
                | "radio"
                | "radiogroup"
                | "range"
                | "region"
                | "roletype"
                | "row"
                | "rowgroup"
                | "rowheader"
                | "scrollbar"
                | "search"
                | "searchbox"
                | "section"
                | "sectionhead"
                | "select"
                | "separator"
                | "slider"
                | "spinbutton"
                | "status"
                | "structure"
                | "suggestion"
                | "switch"
                | "tab"
                | "table"
                | "tablist"
                | "tabpanel"
                | "term"
                | "textbox"
                | "timer"
                | "toolbar"
                | "tooltip"
                | "tree"
                | "treegrid"
                | "treeitem"
                | "widget"
                | "window"
                | (string & {})
        }
    >

    export type Props<T extends Element> = Readonly<{
        [K in keyof Attributes<T>]?: SignalLikeOrValue<Attributes<T>[K]>
    }> &
        Readonly<Directives<T>>
}
