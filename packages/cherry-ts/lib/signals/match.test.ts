import { expect, test } from "bun:test"
import { instanceOf } from "../helpers"
import { Utils } from "../utils"
import { match } from "./match"
import type { Signal } from "./signal"
import { signal } from "./signal"

const describe = () => {
    const line = new Error().stack!.split("\n")[2]!.split(":").at(-2)!.replace(/\D/g, "")
    return `match at line: ${line}`
}

function isNull(value: unknown): value is null {
    return value === null
}

function equals<const TValue>(value: TValue) {
    return (other: unknown): other is TValue => value === other
}

test(describe(), () => {
    const signalValue = signal<string | null>("yo!")

    function toUpperCase(value: string) {
        return value.toUpperCase()
    }

    const result = match(signalValue)
        .case(isNull, () => "value is null")
        .default((value) => {
            expect(value.ref).toBeTypeOf("string")
            return toUpperCase(value.ref)
        })
    result satisfies Signal<string>
    expect(result.ref).toBe("YO!")
})

test(describe(), () => {
    type MyId = Utils.Brand<"MyId", string>
    function createMyId(id: string): MyId {
        return id as MyId
    }
    const signalValue = signal<MyId | null>(createMyId("yo!"))

    const result = match(signalValue)
        .case(isNull, (value) => {
            value.ref satisfies null
            expect(value.ref).toBe(null)
            return value.ref
        })
        .default((value) => {
            value.ref satisfies MyId
            expect(value.ref).toBe(createMyId("yo!"))
            return value.ref
        })

    result satisfies Signal<MyId | null>

    signalValue.ref = null
    signalValue.ref = createMyId("yo!")
})

test(describe(), () => {
    type MyId<T extends string = string> = Utils.Brand<"MyId", T>
    function createMyId<const T extends string>(id: T): MyId<T> {
        return id as MyId<T>
    }
    const signalValue = signal<MyId>(createMyId("yo!"))

    function acceptMyId(id: MyId) {
        return id
    }

    function isMyId<const T extends string>(id: T) {
        return (value: unknown): value is MyId<T> => value === id
    }

    match(signalValue)
        .case(isMyId("another"), (value) => value.ref satisfies MyId)
        .default((value) => {
            value.ref satisfies MyId
            acceptMyId(value.ref)
        }) satisfies Signal<MyId | void>
})

test(describe(), () => {
    type Foo = {
        type: "foo"
        foo: string
        common: string
    }
    type Bar = {
        type: "bar"
        bar: string
        common: string
    }
    type Baz = {
        type: "baz"
        baz: string
        common: number
    }
    type Value = Foo | Bar | Baz

    const signalValue = signal<Value>({ type: "foo", foo: "foo", common: "common" })

    function isType<T extends Value["type"]>(type: T) {
        return (value: Value): value is Extract<Value, { type: T }> => value.type === type
    }

    const result = match(signalValue)
        .case(isType("foo"), (value) => {
            value.ref.foo satisfies string
            value.ref.common satisfies string
            return "foo" as const
        })
        .case(isType("bar"), (value) => {
            value.ref.bar satisfies string
            value.ref.common satisfies string
            return "bar" as const
        })
        .case(isType("baz"), (value) => {
            value.ref.baz satisfies string
            value.ref.common satisfies number
            return "baz" as const
        })
        .default()

    result satisfies Signal<"foo" | "bar" | "baz">

    expect(result.ref).toBe("foo")
})

test(describe(), () => {
    const signalValue = signal<{ foo: string } | null | Error>({ foo: "foo" })
    const result = match(signalValue)
        .case(isNull, (value) => {
            value.ref satisfies null
            throw `value.ref is null, but it should be { foo: "foo" }`
            return "null" as const
        })
        .case(instanceOf(Error), (value) => {
            value.ref satisfies Error
            throw `value.ref is an error, but it should be { foo: "foo" }`
            return "error" as const
        })
        .default((value) => {
            value.ref satisfies object
            true satisfies typeof value.ref extends Error ? false : true
            expect(value.ref.foo).toBe("foo")
            return value.ref
        })

    result satisfies Signal<"null" | "error" | { foo: string }>
})

test(describe(), () => {
    const signalValue = signal<{ foo: string } | null | Error>(new Error())

    const result = match(signalValue)
        .case(isNull, (value) => {
            value.ref satisfies null
            return "null" as const
        })
        .case(instanceOf(Error), (value) => {
            value.ref satisfies Error
            return "error" as const
        })
        .default((value) => {
            value.ref satisfies object
            true satisfies typeof value.ref extends Error ? false : true
            expect(value.ref.foo).toBe("foo")
            return value.ref
        })

    result satisfies Signal<"null" | "error" | { foo: string }>
    expect(result.ref).toBe("error")
})

function isString(value: unknown): value is string {
    return typeof value == "string"
}

test(describe(), () => {
    const signalValue = signal<"foo" | null | Error>("foo")

    const result = match(signalValue)
        .case(isNull, (value) => {
            value.ref satisfies null
            return "null" as const
        })
        .case(isString, (value) => {
            value.ref satisfies "foo"
            return value.ref
        })
        .default((value) => {
            value.ref satisfies Error
            return "error" as const
        })

    result.ref satisfies "null" | "error" | string
    expect(result.ref).toBe("foo")
})
