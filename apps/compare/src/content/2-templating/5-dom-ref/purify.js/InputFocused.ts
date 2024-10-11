import { tags } from "@purifyjs/purify";

const { input } = tags;

export function InputFocused() {
	const host = input().type("text");

	host.element.onConnect(() => {
		host.element.focus();
	});

	return host;
}
