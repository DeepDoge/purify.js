import { derive, INSTANCEOF, match, signal, Tags } from "cherry-ts"

export function Issue() {
    const value = signal(null as string[] | null)

    const arr: string[] = ["a", "b", "c"]

    function toggle() {
        value.ref = value.ref ? null : arr
    }

    const dom = Tags.div([
        Tags.button({ "on:click": toggle }, ["Toggle"]),
        match(value)
            .case({ [INSTANCEOF]: Array }, (value) =>
                derive(() => [value.ref.map((v) => Tags.div([v]))]),
            )
            .default(() => "nothing"),
    ])

    return dom
}
