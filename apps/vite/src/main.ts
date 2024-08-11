import { computed, fragment, ref, tags } from "purified-js"
import { css, sheet } from "./css"
import { PortalExample } from "./portal"
import { SearchExample } from "./search"

{
    const count = ref(0)

    for (let i = 0; i < 1_000; i++) {
        computed(() => count.val * 2).val
    }

    for (let i = 0; i < 1_000; i++) {
        const double = computed(() => count.val * 2)
        double.val
        setTimeout(
            double.follow(() => {}),
            0,
        )
    }
}

const { div, button } = tags

const count = ref(0)
const double = computed(() => count.val * 2)

function App() {
    return div({ id: "app" }).children(Counter(), SearchExample(), PortalExample())
}

function Counter() {
    const host = div()
    const shadow = host.element.attachShadow({ mode: "open" })
    shadow.adoptedStyleSheets.push(counterStyle)

    shadow.append(
        fragment(
            button({ class: "my-button", hello: count })
                .onclick(() => count.val++)
                .children("Count:", count),
            ["Double:", double],
        ),
    )
    return host
}

const counterStyle = sheet(css`
    :host {
        display: grid;
        place-content: center;
    }

    .my-button {
        overflow-wrap: break-word;
    }
`)

document.adoptedStyleSheets.push(
    sheet(css`
        :root {
            color-scheme: dark;
        }
    `),
)

document.body.append(App().element)
