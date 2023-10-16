import { getAppDir, pathJoin } from "@app/macros/path" assert { type: "macro" }
import { readFile } from "@app/macros/readFile" assert { type: "macro" }
import { populate } from "master-ts/core"
import { css, defineCustomTag, html } from "master-ts/extra"
import { Counter } from "./components/counter"
import { commonStyle } from "./styles"

const appTag = defineCustomTag("x-app")
export function App() {
	const host = appTag()
	const dom = host.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(commonStyle, style)

	populate(
		dom,
		html`
			<h1>Hello World!</h1>
			<p>${readFile(pathJoin(getAppDir(), "src", "hello.txt"))}</p>

			<x ${Counter()} class="counter"></x>
		`
	)

	return host
}

const style = css`
	:host {
		display: grid;
		align-content: start;
		justify-items: center;
	}

	h1 {
		font-size: 3em;
	}

	p {
		font-size: 2em;
		text-align: center;
	}

	.counter {
		font-size: 2em;
	}
`

document.body.appendChild(App())
