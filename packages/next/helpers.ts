export let doc = document
export let isFunction = (value: any): value is Function => typeof value == "function"
export let isArray = (value: unknown): value is unknown[] => Array.isArray(value)
export let instanceOf = <T extends (abstract new (...args: any) => any)[]>(
    value: unknown,
    ...types: T
): value is InstanceType<T[number]> => types.some((type) => value instanceof type)

export let startsWith = <const T extends string>(
    text: string,
    start: T,
): text is `${T}${any}` => text.startsWith(start)
export let FOR_EACH = "forEach" as const
export let EMPTY_STRING = "" as const

export let FOLLOW = "follow" as const
export let ON_CONNECT = "onConnect$" as const
export let IMMEDIATE = "immediate" as const
export let MODE = "mode" as const
export let FOLLOW_IMMEDIATE_OPTIONS = {
    [MODE]: IMMEDIATE,
} as const
