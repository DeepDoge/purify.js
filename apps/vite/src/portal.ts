import { Signal, tags } from "purify-js"
import { css, sheet } from "./css"

const { div, button } = tags

const PORTAL_COUNT = 8

export function PortalExample() {
    const host = div()
    const shadow = host.element.attachShadow({ mode: "open" })
    shadow.adoptedStyleSheets.push(style)

    const item = div({ class: "item" }).children("Hey! Teleport ME!!")

    function randomHslColorCSS() {
        return `hsl(${Math.random() * 360}, 100%, 50%)`
    }

    for (let i = 0; i < PORTAL_COUNT; i++) {
        const signal = new Signal(item)
        shadow.append(
            div({ class: "portal", style: `--color:${randomHslColorCSS()}` }).children(
                div({ class: "door" }).children(signal),
                button()
                    .onclick(() => signal.notify())
                    .children("Teleport Here"),
            ).element,
        )
    }

    return host
}

const style = sheet(css`
    :host {
        display: grid;
        --ideal-size: 10em;
        grid-template-columns: repeat(
            auto-fill,
            minmax(min(100%, var(--ideal-size)), 1fr)
        );
        gap: 0.5em;
    }

    .portal {
        aspect-ratio: 1;
        display: grid;
        grid-template-rows: 1fr auto;
        border: solid 0.1em var(--color);
    }

    .portal .door {
        display: grid;
        place-items: center;
    }

    button {
        font: inherit;
        padding: 0.5em;
    }

    .item,
    button {
        overflow-wrap: break-word;
    }
`)
