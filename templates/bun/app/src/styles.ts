import { css } from "master-ts/extra"

export const commonStyle = css`
	*,
	*::before,
	*::after {
		box-sizing: border-box;
	}

	.btn {
		display: inline-block;
		padding: 0.5rem 1rem;
		border: 1px solid hsl(var(--primary) / 0.5);
		border-radius: 0.25rem;
		background-color: hsl(var(--primary) / 0.1);
		color: hsl(var(--primary) / 1);
		text-decoration: none;
		cursor: pointer;
	}

	input,
	textarea {
		font: inherit;
	}
`

document.adoptedStyleSheets.push(
	commonStyle,
	css`
		:root {
			--primary: 208 100% 50%;
			--secondary: 150 100% 50%;
		}

		:root {
			font-family: sans-serif;
			font-size: 1rem;
			line-height: 1.25;
			color-scheme: dark;
		}
	`
)
