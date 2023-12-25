/* 
	All core functionality is in one file, so internal stuff can be isolated
	Code in this file should be as small and as optimized as much as posibble
	While keeping the readablity in an optimum level 
*/

/* 
    While typing be aware of difference between Node, Element HTMLElement, SVGElement MathMLElement and etc.
    `tags` will only work with HTMLElement(s), while all other functions support Element. 
*/

import type { Utils } from "./utils"

let doc = document
let isFunction = (value: any): value is Function => typeof value === "function"
let isArray = (value: unknown): value is unknown[] => Array.isArray(value)
let weakMap = <K extends object, V>() => new WeakMap<K, V>()
let weakSet = WeakSet
let startsWith = <const T extends string>(text: string, start: T): text is `${T}${string}` => text.startsWith(start)
let timeout = setTimeout
let createComment = (...args: Parameters<typeof document.createComment>) => doc.createComment(...args)
let clearBetween = (start: ChildNode, end: ChildNode, inclusive = false) => {
    while (start.nextSibling !== end) start.nextSibling![REMOVE]()
    inclusive && (end[REMOVE](), start[REMOVE]())
}
let FOR_EACH = "forEach" as const
let REMOVE = "remove" as const
let LENGTH = "length" as const
let EMPTY_STRING = "" as const

export namespace Lifecycle {
    export type Connectable = Element | CharacterData
    export type OnConnected = () => void | Cleanup
    export type Cleanup = () => void
    export type Item =
        | [connected: Lifecycle.OnConnected, cleanup: Lifecycle.Cleanup]
        | [connected: Lifecycle.OnConnected]
        | [connected: Lifecycle.OnConnected, void]
}

let lifecycleListeners = weakMap<Node, Lifecycle.Item[]>()
export let onConnected$ = <T extends Lifecycle.Connectable>(node: T, listener: Lifecycle.OnConnected): void => {
    let lifecycleItem: Lifecycle.Item = [() => (lifecycleItem[1] = listener())]
    node.isConnected && lifecycleItem[0]()
    lifecycleListeners.get(node)?.push(lifecycleItem) ?? lifecycleListeners.set(node, [lifecycleItem])
}

if (doc) {
    let connected = new weakSet<Node>()
    /**
     * @param tupleIndex 0 = connected, 1 = disconnected
     */
    let callFnOnTree = (node: Node, tupleIndex: 0 | 1): Node => (
        (tupleIndex as unknown as boolean) == !connected.has(node) ||
            (lifecycleListeners.get(node)?.[FOR_EACH]((callbacks) => callbacks[tupleIndex]?.()),
            Array.from((node as Element).shadowRoot?.childNodes ?? [])[FOR_EACH]((childNode) =>
                callFnOnTree(childNode, tupleIndex)
            ),
            Array.from(node.childNodes)[FOR_EACH]((childNode) => callFnOnTree(childNode, tupleIndex)),
            tupleIndex ? connected.delete(node) : connected.add(node)),
        node
    )

    let mutationObserver = new MutationObserver((mutations) =>
        mutations[FOR_EACH](
            (mutation) => (
                mutation.addedNodes[FOR_EACH]((addedNode) => callFnOnTree(addedNode, 0)),
                mutation.removedNodes[FOR_EACH]((removedNode) => callFnOnTree(removedNode, 1))
            )
        )
    )

    let observe = <T extends Node>(root: T): T => (
        mutationObserver.observe(root, {
            characterData: true,
            childList: true,
            subtree: true
        }),
        root
    )

    observe(doc)
    /* 
        OGAA BOOGA ME LIKE ROCK 🪨
    */
    let ATTACH_SHADOW = "attachShadow" as const
    let PROTOTYPE = "prototype" as const
    let elementPrototype = Element[PROTOTYPE]
    let elementAttachShadow = elementPrototype[ATTACH_SHADOW]
    let elementRemove = elementPrototype[REMOVE]
    let characterDataPrototype = CharacterData[PROTOTYPE]
    let characterDataRemove = characterDataPrototype[REMOVE]
    elementPrototype[ATTACH_SHADOW] = function (this, ...args) {
        return observe(elementAttachShadow.apply(this, args))
    }
    elementPrototype[REMOVE] = function (this) {
        return elementRemove.call(callFnOnTree(this, 1))
    }
    characterDataPrototype[REMOVE] = function (this) {
        return characterDataRemove.call(callFnOnTree(this, 1))
    }
}

export type SignalOrValue<T> = T | Signal<T>
export type SignalOrValueOrFn<T> = SignalOrValue<T> | ((...args: unknown[]) => T)
export type SignalOrFn<T> = Signal<T> | ((...args: unknown[]) => T)
export interface Signal<T> {
    readonly ref: T
    follow(follower: Signal.Follower<T>, options?: Signal.Follow.Options): Signal.Follow
    follow$<T extends Lifecycle.Connectable>(node: T, ...args: Parameters<this["follow"]>): void
    ping(): void
}
export namespace Signal {
    export interface Mut<T> extends Signal<T> {
        ref: T
        asImmutable(): Signal<T>
    }

    export type Builder = <T>(initial: T, updater?: Updater<T>) => Signal.Mut<T>
    export type Updater<T> = (set: (value: T) => void) => (() => void) | void

    export type Follow = { unfollow: Unfollow }
    export type Unfollow = () => void
    export namespace Follow {
        export type Options = {
            mode?: typeof FOLLOW_MODE_ONCE | typeof FOLLOW_MODE_NORMAL | typeof FOLLOW_MODE_IMMEDIATE
        }
    }
    export type Follower<T> = (value: T) => void
}

let FOLLOW = "follow" as const
let FOLLOW$ = (FOLLOW + "$") as `${typeof FOLLOW}$`
let UNFOLLOW = ("un" + FOLLOW) as `un${typeof FOLLOW}`
let FOLLOW_MODE_ONCE = "once" as const
let FOLLOW_MODE_NORMAL = "normal" as const
let FOLLOW_MODE_IMMEDIATE = "immediate" as const

let FOLLOW_IMMEDIATE_OPTION = { mode: FOLLOW_MODE_IMMEDIATE } as const satisfies Signal.Follow.Options

let signals = new weakSet<Signal<unknown>>()

export let isSignal = (value: any): value is Signal<unknown> => signals.has(value)

export let isSignalOrFn = <T>(value: any): value is SignalOrFn<T> => isSignal(value) || isFunction(value)

export let signalFrom = <T>(src: SignalOrFn<T>): Signal<T> => (isFunction(src) ? derive(src) : src)

export let signal: Signal.Builder = (currentValue, updater) => {
    type T = typeof currentValue

    let followers = new Set<Signal.Follower<T>>()

    let ping: Signal<T>["ping"] = () => followers[FOR_EACH]((follower) => follower(currentValue))
    let set = (value: T) => value !== currentValue && ((currentValue = value), ping())

    let cleanup: (() => void) | void
    let passive = () => cleanup && (cleanup(), (cleanup = void 0))
    let active = () => updater && !cleanup && (cleanup = updater(set))

    let self: Signal.Mut<T> = {
        set ref(value) {
            set(value)
        },
        get ref() {
            active(), timeout(() => followers.size || passive(), 5000)
            usedSignalsTail?.add(self)
            return currentValue
        },
        ping,
        [FOLLOW]: (follower, options = {}) => (
            active(),
            options.mode === FOLLOW_MODE_IMMEDIATE && follower(currentValue),
            followers.add(follower),
            {
                [UNFOLLOW]() {
                    followers.delete(follower), followers.size || passive()
                }
            }
        ),
        [FOLLOW$]: (node, ...args) => onConnected$(node, () => self[FOLLOW](...args)[UNFOLLOW]),
        asImmutable: () => self
    }
    signals.add(self)
    return self
}

let usedSignalsTail: Set<Signal<unknown>> | undefined
let callAndCaptureUsedSignals = <T, TArgs extends unknown[]>(
    fn: (...args: TArgs) => T,
    usedSignals?: Set<Signal<unknown>>,
    ...args: TArgs
): T => {
    let userSignalsBefore = usedSignalsTail
    usedSignalsTail = usedSignals
    try {
        return fn(...args)
    } catch (error) {
        throw error
    } finally {
        usedSignalsTail = userSignalsBefore
    }
}

let deriveCache = weakMap<Function, Signal.Mut<unknown>>()
export let derive = <T>(fn: () => T, staticDependencies?: readonly Signal<unknown>[]): Signal<T> => {
    let value = deriveCache.get(fn) as Signal.Mut<T> | undefined
    return staticDependencies
        ? signal<T>(fn(), (set) => {
              let follows = staticDependencies.map((dependency) => dependency.follow(() => set(fn())))
              return () => follows.forEach((follow) => follow.unfollow())
          })
        : value ||
              (deriveCache.set(
                  fn,
                  (value = signal<T>(undefined!, (set) => {
                      let toUnfollow: Set<Signal<unknown>> | undefined
                      let follows = weakMap<Signal<unknown>, Signal.Follow>()
                      let unfollow = () => toUnfollow?.[FOR_EACH]((signal) => follows.get(signal)!.unfollow())
                      let update = () => {
                          let toFollow = new Set<Signal<unknown>>()
                          set(callAndCaptureUsedSignals(fn, toFollow))
                          toFollow[FOR_EACH]((signal) => {
                              !follows.has(signal) && follows.set(signal, signal.follow(update))
                              toUnfollow?.delete(signal)
                          })
                          unfollow()
                          toUnfollow = toFollow
                      }

                      update()

                      return unfollow
                  }))
              ),
              value)
}

let bindSignalAsFragment = <T>(signalOrFn: SignalOrFn<T>): DocumentFragment => {
    let start = createComment(EMPTY_STRING)
    let end = createComment(EMPTY_STRING)
    let signalFragment = fragment(start, end)

    type Item = Readonly<{
        v: unknown
        s: Comment
        e: Comment
    }>

    // TODO: make this not use an array, use the DOM alone
    let items: Item[] = []
    let createItem = (value: unknown, insertBefore: number = -1) => {
        let itemStart = createComment(EMPTY_STRING)
        let itemEnd = createComment(EMPTY_STRING)

        let self: Item = {
            v: value,
            s: itemStart,
            e: itemEnd
        }

        let itemBefore = items[insertBefore]
        itemBefore
            ? (itemBefore.s.before(itemStart, toNode(value), itemEnd), items.splice(insertBefore, 0, self))
            : (items.push(self), end.before(itemStart, toNode(value), itemEnd))

        return self
    }

    let removeItem = (index: number) => {
        let item = items[index]!
        clearBetween(item.s, item.e, true)
        items.splice(index, 1)
    }

    let oldValue: unknown
    signalFrom(signalOrFn)[FOLLOW$](
        start,
        (value: T) => {
            if (!isArray(oldValue) || !isArray(value)) clearBetween(start, end), (items[LENGTH] = 0)
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
                          : currentIndex + 1 < value[LENGTH] && value[currentIndex + 1] === currentItem.v
                            ? createItem(currentValue, currentIndex++)
                            : (removeItem(currentIndex), createItem(currentValue, currentIndex)))
            }
            clearBetween(items[value[LENGTH] - 1]?.e ?? start, end)
            items.splice(value[LENGTH])
        },
        FOLLOW_IMMEDIATE_OPTION
    )

    return signalFragment
}

let toNode = (value: unknown): Node => {
    return value === null
        ? fragment()
        : isArray(value)
          ? fragment(...value.map(toNode))
          : value instanceof Node
            ? value
            : isSignalOrFn(value)
              ? bindSignalAsFragment(value)
              : doc.createTextNode(value + EMPTY_STRING)
}

export let fragment = (...children: Template.Member[]): DocumentFragment => {
    let result = doc.createDocumentFragment()
    result.append(...children.map(toNode))
    return result
}

type InputElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
let CHECKED = "checked" as const
let VALUE = "value" as const
let VALUE_AS_NUMBER = (VALUE + "AsNumber") as `${typeof VALUE}AsNumber`
let VALUE_AS_DATE = (VALUE + "AsDate") as `${typeof VALUE}AsDate`
let inputValueKeyMap = {
    radio: CHECKED,
    checkbox: CHECKED,
    range: VALUE_AS_NUMBER,
    number: VALUE_AS_NUMBER,
    date: VALUE_AS_DATE,
    "datetime-local": VALUE_AS_DATE,
    month: VALUE_AS_DATE,
    time: VALUE_AS_DATE,
    week: VALUE_AS_DATE
} as const
let getInputValueKey = <Type extends keyof typeof inputValueKeyMap | (string & {})>(type: Type) =>
    (inputValueKeyMap[type as keyof typeof inputValueKeyMap] ?? VALUE) as Type extends keyof typeof inputValueKeyMap
        ? (typeof inputValueKeyMap)[Type]
        : typeof VALUE

export namespace Template {
    export type Member =
        | string
        | number
        | boolean
        | bigint
        | null
        | Node
        | (() => Member)
        | (Signal<unknown> & { ref: Member })

    export type Attributes<T extends Element> = T extends HTMLElement
        ? Attributes.HTML<T>
        : T extends SVGElement
          ? Attributes.SVG<T>
          : T extends MathMLElement
            ? Attributes.MathML<T>
            : Attributes.Global<T>
    export namespace Attributes {
        export type Global<T extends Element> = {
            [key: string]: unknown
        } & {
            id?: string
            class?: string
            style?: string
            tabindex?: string
        } & {
            [K in Utils.Kebab<keyof ARIAMixin>]?: K extends Utils.Kebab<infer AriaKey extends keyof ARIAMixin>
                ? ARIAMixin[AriaKey]
                : never
        } & {
            [K in `class:${string}`]?: SignalOrValueOrFn<boolean>
        } & {
            [K in `style:${Exclude<
                Utils.Kebab<Extract<keyof CSSStyleDeclaration, string>>,
                `webkit-${string}`
            >}`]?: K extends `style:${Utils.Kebab<Extract<infer StyleKey extends keyof CSSStyleDeclaration, string>>}`
                ? SignalOrValueOrFn<CSSStyleDeclaration[StyleKey]>
                : never
        } & {
            [K in `on:${keyof GlobalEventHandlersEventMap}`]?: K extends `on:${infer EventName extends
                keyof GlobalEventHandlersEventMap}`
                ? ((event: GlobalEventHandlersEventMap[EventName] & { target: T }) => void) | Function
                : never
        } & {
            [K in `on:${string}`]?: ((event: Event & { target: T }) => void) | Function
        }

        export type HTML<T extends HTMLElement> = Global<T> & {
            title?: string
        } & {
            [K in `on:${keyof HTMLElementEventMap}`]?: K extends `on:${infer EventName extends
                keyof HTMLElementEventMap}`
                ? ((event: HTMLElementEventMap[EventName] & { target: T }) => void) | Function
                : never
        } & {
            [K in `on:${string}`]?: ((event: Event & { target: T }) => void) | Function
        } & (T extends InputElement
                ?
                      | { type: string; "bind:value"?: Signal.Mut<HTMLInputElement["value"]> }
                      | {
                            [K in keyof typeof inputValueKeyMap]: {
                                type: K
                                "bind:value"?: Signal.Mut<HTMLInputElement[(typeof inputValueKeyMap)[K]]>
                            }
                        }[keyof typeof inputValueKeyMap]
                : {})

        export type SVG<T extends SVGElement> = Global<T> & {
            fill?: string
        } & {
            [K in `on:${keyof SVGElementEventMap}`]?: K extends `on:${infer EventName extends keyof SVGElementEventMap}`
                ? ((event: SVGElementEventMap[EventName] & { target: T }) => void) | Function
                : never
        } & {
            [K in `on:${string}`]?: ((event: Event & { target: T }) => void) | Function
        }

        export type MathML<T extends MathMLElement> = Global<T> & {} & {
            [K in `on:${keyof MathMLElementEventMap}`]?: K extends `on:${infer EventName extends
                keyof MathMLElementEventMap}`
                ? ((event: MathMLElementEventMap[EventName] & { target: T }) => void) | Function
                : never
        } & {
            [K in `on:${string}`]?: ((event: Event & { target: T }) => void) | Function
        }
    }

    export type Builder<T extends Element> = {
        (attributes?: Attributes<T>, children?: Member[]): T
        (children?: Member[]): T
    }
}

export type Tags = {
    [K in keyof HTMLElementTagNameMap]: Template.Builder<HTMLElementTagNameMap[K]>
} & {
    [unknownTag: string]: Template.Builder<HTMLElement>
}
export let tags = new Proxy(
    {},
    {
        get:
            (_, tagName: string) =>
            (...args: Parameters<Template.Builder<HTMLElement>>) =>
                populate(doc.createElement(tagName), ...args)
    }
) as Tags

let bindOrSet = <T>(node: Element | CharacterData, value: SignalOrValueOrFn<T>, then: (value: T) => void): void =>
    isSignalOrFn(value) ? signalFrom(value)[FOLLOW$](node, then, FOLLOW_IMMEDIATE_OPTION) : then(value)

let bindSignalAsValue = <T extends InputElement>(
    element: T,
    signal: Signal.Mut<HTMLInputElement[ReturnType<typeof getInputValueKey<T["type"]>>]>
) => (
    element.addEventListener(
        "input",
        (event: Event) => (signal.ref = (event.target as T)[getInputValueKey(element.type)])
    ), // All new browsers will remove the listeners automatically. So no need to waste code removing it manually here.
    signal[FOLLOW$](element, (value) => (element[getInputValueKey(element.type)] = value), FOLLOW_IMMEDIATE_OPTION)
)

export let populate: {
    <T extends Element & ElementCSSInlineStyle>(
        element: T,
        attributes?: Template.Attributes<T>,
        children?: Template.Member[]
    ): T
    <T extends Node>(node: T, children?: Template.Member[]): T
} = (...args: any) => (isArray(args[1]) ? (populate_Node as any)(...args) : (populate_Element as any)(...args))
let populate_Node = <T extends Node>(node: T, children?: Template.Member[]) => (
    children && node.appendChild(toNode(children)), node
)
let populate_Element = <T extends Element & ElementCSSInlineStyle>(
    element: T,
    attributes?: Template.Attributes<T>,
    children?: Template.Member[]
) => (
    attributes &&
        Object.keys(attributes)[FOR_EACH]((key) =>
            startsWith(key, "bind:")
                ? bindSignalAsValue(element as never, attributes[key] as never)
                : startsWith(key, "style:")
                  ? bindOrSet(
                        element,
                        attributes[key],
                        (value) =>
                            element.style?.setProperty(key.slice(6), value === null ? value : value + EMPTY_STRING)
                    )
                  : startsWith(key, "class:")
                    ? bindOrSet(element, attributes[key], (value) => element.classList?.toggle(key.slice(6), !!value))
                    : startsWith(key, "on:")
                      ? element.addEventListener(key.slice(3), attributes[key] as EventListener)
                      : bindOrSet(element, attributes[key], (value) =>
                            value === null
                                ? element.removeAttribute?.(key)
                                : element.setAttribute?.(key, value + EMPTY_STRING)
                        )
        ),
    populate_Node(element, children)
)
