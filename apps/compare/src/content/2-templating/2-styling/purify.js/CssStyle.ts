import { fragment, tags } from "@purifyjs/core";
import css from "./style.css?raw";

const sheet = new CSSStyleSheet();
sheet.replaceSync(css);

const { div, h1, button } = tags;

export function CssStyle() {
	const host = div();
	const shadow = host.element.attachShadow({
		mode: "open",
	});
	shadow.adoptedStyleSheets.push(sheet);

	shadow.append(
		fragment(
			h1({ class: "title" }).textContent("I am red"),
			button({
				style: "font-size: 10rem",
			}).textContent("I am a button"),
		),
	);

	return host;
}
