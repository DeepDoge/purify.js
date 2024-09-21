import { fragment, tags } from "purify-js";
import "./style.css";

const { h1, button } = tags;

export function CssStyle() {
	return fragment(
		h1({ class: "title" }).children("I am red"),
		button({
			style: "font-size: 10rem",
		}).children("I am a button"),
	);
}
