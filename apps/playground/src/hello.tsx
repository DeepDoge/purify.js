import { css, CustomElement, sheet, signal, tags } from "cherry-ts"

const helloTag = CustomElement("x-hello")
export function Hello() {
    const root = helloTag()
    const dom = root.attachShadow({ mode: "open" })
    dom.adoptedStyleSheets.push(HelloSheet)

    const n = signal("")

    dom.append(
        (
            <>
                <div class="hello">
                    {n}
                    Hello
                    {123}
                    {Time()}
                    {World("World")}
                    {tags.input({ type: "number", "bind:value": n })}
                    {/* <input type="number" bind:value={n}></input> Doesn't work */}
                </div>
                <div>123</div>
            </>
        ).render(),
    )

    return root
}

function Time() {
    return Date.now()
}

function World(text: string) {
    return <div class="world">{text}</div>
}

const HelloSheet = sheet(css`
    div {
        color: red;
    }
`)
