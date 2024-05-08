import { css, derived, pipe, ref, sheet, tags } from "cherry-js"
import "./style.css"

const { button, div, style } = tags

const time = ref(Date.now(), (set) => {
    const id = setInterval(() => set(Date.now()), 1000)
    return () => clearInterval(id)
})

const timeString = ref("", (set) =>
    time.follow((time) => set(new Date(time).toLocaleString())),
)

/* document.body.append(
    div().render(() => [
        div().render(() => [
            "The time is: ",
            derived(() => new Date(time.val).toLocaleString()),
        ]),
        div().render(() => ["Timer ", time]),
        fragment(["hello", " ", "world"]),
        div().render(() => [
            button()
                .onclick(() => alert("Hello, world!"))
                .render(() => ["Click me!"]),
        ]),
    ]),
) */

function Counter(value = ref(0)) {
    const host = div().render()
    host.append(counterStyle.cloneNode(true))

    host.append(
        div().render(() => [
            "Counter: ",
            value,
            button()
                .onclick(() => value.val++)
                .render(() => ["Increment"]),
            button()
                .onclick(() => value.val--)
                .render(() => ["Decrement"]),
        ]),
    )

    return host
}

const counterStyle = style().render(() => [
    css`
        @scope {
            :scope {
                font-size: 2em;
            }
        }
    `,
])

function App() {
    const host = div().render()
    const root = host.attachShadow({ mode: "open" })
    root.adoptedStyleSheets.push(cardSheet)

    const count = ref(123)

    pipe(root).render(() => [
        div().render(() => [
            div().render(() => ["Hello, world!"]),
            div().render(() => ["The time is: ", timeString]),
        ]),
        Counter(count),
        derived(() => (count.val % 2 === 0 ? "Even" : "Odd")),
    ])

    return host
}

const cardSheet = sheet(css`
    :host {
        background-color: red;
    }
`)

document.body.append(App())
