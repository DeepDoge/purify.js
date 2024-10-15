import { Lifecycle, tags } from "@purifyjs/core";

const { input } = tags;

export function InputFocused() {
	const host = input()
    .use(autoFocus())
    .type("text");

 return host;
}

export function autoFocus(): Lifecycle.OnConnected {
  return (element) => element.focus()
}
