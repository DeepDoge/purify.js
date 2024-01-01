import { populate, signal } from "cherry-ts/core.ts"
import { css } from "cherry-ts/extra/css.ts"
import { html } from "cherry-ts/extra/html.ts"
import { commonStyleSheet } from "../styles.ts"

const hash = signal(location.hash, (set) => {
    const interval = setInterval(() => set(location.hash), 100)
    return () => clearInterval(interval)
})

export function Heading<T extends HTMLHeadingElement>(host: T, id: string) {
    populate(host, {
        class: "heading",
        id,
        "class:active": () => hash.ref === `#${id}`,
    })
    const dom = host.attachShadow({ mode: "open" })
    dom.adoptedStyleSheets.push(commonStyleSheet, sheet)

    hash.follow$(
        host,
        (hash) => {
            if (hash === `#${id}`)
                host.scrollIntoView({ block: "center", inline: "nearest" })
        },
        { mode: "immediate" },
    )

    populate(dom, html`<a href=${`#${id}`}>#</a> <slot />`)

    return host
}

const sheet = css`
    a {
        color: inherit;
        opacity: 0.5;
        text-decoration: none;
    }

    a:hover {
        text-decoration: underline;
    }
`.toSheet()
