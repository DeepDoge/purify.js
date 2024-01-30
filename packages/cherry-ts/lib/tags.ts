import {
    EMPTY_STRING,
    FOLLOW$,
    FOLLOW_IMMEDIATE_OPTIONS,
    FOR_EACH,
    LENGTH,
    clearBetween,
    createComment,
    doc,
    instanceOf,
    isArray,
    startsWith,
} from "./helpers"
import { Lifecycle } from "./lifecyle"
import {
    Signal,
    SignalLike,
    SignalLikeOrValue,
    isSignalLike,
    signalFrom,
} from "./signals/signal"
import { Utils } from "./utils"

export let Tags = new Proxy(
    {},
    {
        get:
            (_, tag: string) =>
            (...args: Parameters<Tags.Builder<HTMLElement>>) =>
                populate(doc.createElement(tag), ...args),
    },
) as Tags

export let fragment: Tags.Builder<DocumentFragment> = (children) => {
    let fragment = doc!.createDocumentFragment()
    children && fragment.append(...children.map(toNode))
    return fragment
}

let signalAsFragment = <T>(signalLike: SignalLike<T>): DocumentFragment => {
    let start = createComment(EMPTY_STRING)
    let end = createComment(EMPTY_STRING)
    let signalFragment = fragment([start, end])

    type Item = {
        v: unknown
        s: Comment
        e: Comment
    }

    // TODO: make this not use an array, use the DOM alone
    let items: Item[] = []
    let createItem = (value: unknown, insertBefore: number = -1) => {
        let itemStart = createComment(EMPTY_STRING)
        let itemEnd = createComment(EMPTY_STRING)

        let self: Item = {
            v: value,
            s: itemStart,
            e: itemEnd,
        }

        let itemBefore = items[insertBefore]
        itemBefore
            ? (itemBefore.s.before(itemStart, toNode(value), itemEnd),
              items.splice(insertBefore, 0, self))
            : (items.push(self), end.before(itemStart, toNode(value), itemEnd))

        return self
    }

    let removeItem = (index: number) => {
        let item = items[index]!
        clearBetween(item.s, item.e, true)
        items.splice(index, 1)
    }

    let oldValue: unknown
    signalFrom(signalLike)[FOLLOW$](
        start,
        (value: T) => {
            if (!isArray(oldValue) || !isArray(value))
                clearBetween(start, end), (items[LENGTH] = 0)
            oldValue = value
            if (!isArray(value)) return end.before(toNode(value))

            for (let currentIndex = 0; currentIndex < value[LENGTH]; currentIndex++) {
                let currentItem = items[currentIndex]
                let nextItem = items[currentIndex + 1]
                let currentValue = value[currentIndex]

                !currentItem
                    ? createItem(currentValue)
                    : currentValue !== currentItem.v &&
                      (nextItem && currentValue === nextItem.v
                          ? removeItem(currentIndex)
                          : currentIndex + 1 < value[LENGTH] &&
                              value[currentIndex + 1] === currentItem.v
                            ? createItem(currentValue, currentIndex++)
                            : (removeItem(currentIndex),
                              createItem(currentValue, currentIndex)))
            }
            clearBetween(items[value[LENGTH] - 1]?.e ?? start, end)
            items.splice(value[LENGTH])
        },
        FOLLOW_IMMEDIATE_OPTIONS,
    )

    return signalFragment
}

let toNode = (value: unknown): CharacterData | Element | DocumentFragment =>
    value === null
        ? fragment()
        : isArray(value)
          ? fragment(value.map(toNode))
          : instanceOf(value, Element, DocumentFragment, CharacterData)
            ? value
            : isSignalLike(value)
              ? signalAsFragment(value)
              : doc!.createTextNode(value + EMPTY_STRING)

let bindOrSet = <T>(
    node: Lifecycle.Connectable,
    value: SignalLikeOrValue<T> | T,
    then: (value: T) => void,
): void =>
    isSignalLike(value)
        ? signalFrom(value)[FOLLOW$](node, then, FOLLOW_IMMEDIATE_OPTIONS)
        : then(value)

let bindSignalAsValue = <
    T extends HTMLElement,
    TKey extends Extract<
        keyof T,
        Tags.InputElementTypeValueMap[keyof Tags.InputElementTypeValueMap]
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
    signal[FOLLOW$](element, (value) => (element[key] = value), FOLLOW_IMMEDIATE_OPTIONS)
)

export let populate = <T extends ParentNode>(
    ...args: [node: T, ...Parameters<Tags.Builder<T>>]
) => (isArray(args[1]) ? populateNode(...args) : (populateElement as Function)(...args))

let populateNode = <T extends ParentNode>(node: T, children?: Tags.MemberOf<T>[]) => (
    children && node.append(toNode(children)), node
)
let populateElement = <T extends Element>(
    element: T,
    props?: Tags.Props<T>,
    children?: Tags.MemberOf<T>[],
) => (
    props &&
        Object.keys(props)[FOR_EACH]((key) =>
            startsWith(key, "bind:")
                ? bindSignalAsValue(
                      element as never,
                      key.slice(5) as never,
                      props[key] as never,
                  )
                : startsWith(key, "style:")
                  ? bindOrSet(element, props[key]!, (value) =>
                        (element as never as ElementCSSInlineStyle).style?.setProperty(
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
                      : startsWith(key, "attr:")
                        ? bindOrSet(element, props[key], (value) =>
                              value === null
                                  ? element.removeAttribute(key.slice(5))
                                  : element.setAttribute(
                                        key.slice(5),
                                        value + EMPTY_STRING,
                                    ),
                          )
                        : bindOrSet(
                              element,
                              props[key],
                              (value) =>
                                  ((element as Record<string, unknown>)[key] = value),
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

    export type Builder<T extends ParentNode> = T extends Element
        ? (
              ...args:
                  | [props?: Props<T>, children?: MemberOf<T>[]]
                  | [children?: MemberOf<T>[]]
          ) => T
        : (children?: MemberOf<T>[]) => T

    type Styles<T extends ElementCSSInlineStyle> = Omit<
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

    export type InputElement = HTMLElement & {
        type: string
        value: string | null
    }

    export type InputElementTypeValueMap = {
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
    } & {
        [K in string & {}]: "value"
    }
    type InputValueFieldName = InputElementTypeValueMap[keyof InputElementTypeValueMap]

    type InputElementProps<E extends InputElement> =
        | {
              [T in keyof InputElementTypeValueMap]: {
                  type: T
              } & {
                  [K in InputElementTypeValueMap[T]]?: SignalLikeOrValue<
                      E[Extract<K, keyof E>]
                  >
              } & {
                  [K in InputElementTypeValueMap[T] as `bind:${K}`]?: Signal.Mut<
                      E[Extract<K, keyof E>]
                  >
              }
          }[keyof InputElementTypeValueMap]
        | {}

    type Directives<T extends Element> = ({
        [K in `on:`]?: never
    } & {
        [K in `on:${string}`]?: { (event: Event & { currentTarget: T }): void } | Function
    }) & {
        [K in keyof EventMap<T> as K extends string ? `on:${K}` : never]?:
            | {
                  (event: EventMap<T>[K] & { currentTarget: T }): void
              }
            | Function
    } & (T extends ElementCSSInlineStyle
            ? {
                  [K in `style:`]?: never
              } & {
                  [K in `style:${string}`]?: SignalLikeOrValue<string | null>
              } & {
                  [K in keyof Styles<T> as K extends string
                      ? `style:${K}`
                      : never]?: SignalLikeOrValue<string | null>
              }
            : Utils.EmptyObject) &
        (T extends { className: string | null }
            ? {
                  [K in `class:`]?: never
              } & {
                  [K in `class:${string}`]?: SignalLikeOrValue<boolean | {}>
              }
            : Utils.EmptyObject) &
        ({
            [K in `attr:`]?: never
        } & {
            [K in `attr:${string}`]?: SignalLikeOrValue<string | boolean | null>
        })

    type MutableFields<T extends Element> = {
        [K in Utils.MutableKeysOf<Utils.PickLiteralKeys<T>> as Utils.Fn extends T[K]
            ? never
            : object extends T[K]
              ? never
              : K]?: K extends "role" ? ARIARole : T[K]
    }

    export type Props<T extends Element> = Readonly<
        Directives<T> &
            (T extends InputElement
                ? Omit<MutableFields<T>, "type" | InputValueFieldName> &
                      InputElementProps<T>
                : MutableFields<T>)
    >
}

type ARIARole =
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
