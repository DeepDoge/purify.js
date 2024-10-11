import { ref, tags } from "@purifyjs/purify";

const { h1 } = tags;

export function Name() {
	const name = ref("John");

	return h1().children("Hello", name);
}
