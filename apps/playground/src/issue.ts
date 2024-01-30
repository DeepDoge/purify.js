import { match, signal, Tags } from "cherry-ts"
import { instanceOf } from "cherry-ts/lib/helpers"
import { Utils } from "cherry-ts/lib/utils"

export function Issue() {
    const value = signal(null as string[] | null)

    const arr: string[] = ["a", "b", "c"]

    function toggle() {
        value.ref = value.ref ? null : arr
    }

    const dom = Tags.div([
        Tags.button({ "on:click": toggle }, ["Toggle"]),
        match(value)
            .case(instanceOf(Array), (value) => [value.ref.map((v) => Tags.div([v]))])
            .default(() => "nothing"),
    ])

    const dom2 = Tags.div([
        Tags.button({ "on:click": toggle }, ["Toggle"]),
        () =>
            value.ref instanceof Array
                ? [value.ref.map((v) => Tags.div([v]))]
                : "nothing",
    ])

    return dom
}

function foo(value: unknown): value is { a: string } {
    return true
}

type InferIs<T extends Utils.Fn> = T extends (value: any) => value is infer R ? R : never

type _ = InferIs<typeof foo>
