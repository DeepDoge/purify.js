import { css, customTag, sheet } from "master-ts"

const helloTag = customTag("x-hello")
export function Hello() {
    const root = helloTag()
    const dom = root.attachShadow({ mode: "open" })
    dom.adoptedStyleSheets.push(HelloSheet)

    dom.append(
        <>
            <div class="hello">
                Hello
                {World("World")}
            </div>
            <div>123</div>
        </>
    )

    return root
}

function World(text: string) {
    return <div class="world">{text}</div>
}

const HelloSheet = sheet(css`
    div {
        color: red;
    }
`)
