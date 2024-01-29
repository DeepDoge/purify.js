import { derive, signal, Tags } from "cherry-ts-next"

export function Issue() {
    const value = signal(null as string[] | null)

    const arr: string[] = ["a", "b", "c"]

    function toggle() {
        value.ref = value.ref ? null : arr
    }

    const dom = Tags.div([
        Tags.button({ "on:click": toggle }, ["Toggle"]),
        derive(() =>
            value.ref instanceof Array
                ? derive(() => [value.ref.map((v) => Tags.div([v]))])
                : "nothing",
        ),
    ])

    return dom
}
