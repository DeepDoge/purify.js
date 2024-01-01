import { INSTANCEOF, each, match, signal, tags } from "cherry-ts"

export function Issue() {
    const value = signal(null as string[] | null)

    const arr: string[] = ["a", "b", "c"]

    function toggle() {
        value.ref = value.ref ? null : arr
    }

    return [
        tags.button({ "on:click": toggle }, ["Toggle"]),
        match(value)
            .case({ [INSTANCEOF]: Array }, (value) =>
                each(value)
                    .key((value) => value)
                    .as((item) => item),
            )
            .default(() => "nothing"),
    ] as const
}
