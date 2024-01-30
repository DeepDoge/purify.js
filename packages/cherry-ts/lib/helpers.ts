import { Signal } from "./signals/signal"
export let NULL: null = null
export let doc = (typeof window)[8] ? NULL : document
export let isFunction = (value: any): value is Function => typeof value == "function"
export let instanceOf =
    <T extends (abstract new (...args: any) => any)[]>(...types: T) =>
    (value: unknown): value is InstanceType<T[number]> =>
        types.some((type) => value instanceof type)
export let isArray = instanceOf(Array)

export let startsWith = <const T extends string>(
    text: string,
    start: T,
): text is `${T}${string}` => text.startsWith(start)
export let weakMap = <K extends object, V>() => new WeakMap<K, V>()
export let weakSet = <T extends object>() => new WeakSet<T>()

export let EMPTY_STRING = "" as const
export let FOR_EACH = "forEach" as const satisfies keyof Set<unknown>
export let FOLLOW = "follow" as const satisfies keyof Signal<unknown>
export let FOLLOW$ = "follow$" as const satisfies keyof Signal<unknown>
export let UNFOLLOW = "unfollow" as const satisfies keyof Signal.Follow
export let LENGTH = "length" as const satisfies keyof ArrayLike<unknown>
export let IMMEDIATE = "immediate" as const satisfies Signal.Follow.Options["mode"]
export let MODE = "mode" as const satisfies keyof Signal.Follow.Options
export let REMOVE = "remove" as const satisfies keyof ChildNode
export let FOLLOW_IMMEDIATE_OPTIONS = {
    [MODE]: IMMEDIATE,
} as const satisfies Signal.Follow.Options

export let createComment = (...args: Parameters<typeof document.createComment>) =>
    doc!.createComment(...args)
export let clearBetween = (start: ChildNode, end: ChildNode, inclusive = false) => {
    while (start.nextSibling !== end) start.nextSibling![REMOVE]()
    inclusive && (end[REMOVE](), start[REMOVE]())
}
