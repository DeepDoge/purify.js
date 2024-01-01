import { populate } from "cherry-ts/core.ts"
import { css } from "cherry-ts/extra/css.ts"
import { defineCustomTag } from "cherry-ts/extra/custom-tags.ts"
import { html } from "cherry-ts/extra/html.ts"
import { commonStyleSheet } from "../styles.ts"

const demoTag = defineCustomTag("x-demo")
export function DemoWrapper() {
    const host = demoTag()
    const dom = host.attachShadow({ mode: "open" })
    dom.adoptedStyleSheets.push(commonStyleSheet, sheet)

    populate(
        dom,
        html`
            <div class="content">
                <slot></slot>
            </div>
        `,
    )

    return host
}

const sheet = css`
    :host {
        display: grid;
        padding-block: 0.5em;
    }

    .content {
        background-color: hsl(0, 0%, 0%);
        padding: 0.75em;
    }
`.toSheet()

export type Test = {}
