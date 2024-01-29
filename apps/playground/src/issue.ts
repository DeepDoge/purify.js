import { derive, signal, tags } from "cherry-ts"

export function Issue() {
    const value = signal(null as string[] | null)

    const arr: string[] = ["a", "b", "c"]

    function toggle() {
        value.ref = value.ref ? null : arr
    }

    const dom = tags.div([
        tags.button({ "on:click": toggle }, ["Toggle"]),
        derive(
            () => (
                console.log("outer", value.ref, dom.innerHTML),
                value.ref instanceof Array
                    ? derive(
                          () => (
                              console.log("inner", value.ref, dom.innerHTML),
                              [
                                  tags.div({ "data-test": "inner" }),
                                  value.ref.map((v) => tags.div([v])),
                              ]
                          ),
                      )
                    : "nothing"
            ),
        ),
    ])

    return dom
}
