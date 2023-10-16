import { populate, signal } from "master-ts/core"
import { css, defineCustomTag, html } from "master-ts/extra"
import { commonStyle } from "~/styles"

const counterTag = defineCustomTag("x-counter")
export function Counter(counter = signal(0)) {
	const host = counterTag()
	const dom = host.attachShadow({ mode: "open" })
	dom.adoptedStyleSheets.push(commonStyle, style)

	function increment() {
		counter.ref++
	}

	function decrement() {
		counter.ref--
	}

	const multiplier = signal(2)

	populate(
		dom,
		html`
			<button class="btn" on:click=${increment}>+</button>
			<span class="count">
				${counter} * <input type="number" bind:value=${multiplier} /> = ${() => counter.ref * multiplier.ref}
			</span>
			<button class="btn" on:click=${decrement}>-</button>
		`
	)

	return host
}

const style = css`
	:host {
		display: grid;
		grid-auto-flow: column;

		align-items: center;
		gap: 0.5rem;

		font-size: 1em;
	}

	button {
		display: grid;
		place-items: center;
		width: 3ch;
		aspect-ratio: 1;
		font-size: 2em;
	}

	input {
		width: 5ch;
	}

	.count {
		text-align: center;
		font-size: 1.25em;
	}
`
