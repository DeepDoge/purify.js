import { fragment, ref, tags } from "purify-js";

const { p, button } = tags;

export function Counter() {
	const count = ref(0);

	function incrementCount() {
		count.val++;
	}

	return fragment(
		p().children("Count: ", count),
		button()
			.onclick(incrementCount)
			.children("Increment"),
	);
}
