import { ref, tags } from "purify-js";

const { div } = tags;

export function DoubleCount() {
	const count = ref(10);
	const doubleCount = count.derive((count) => count * 2);

	return div().children(doubleCount);
}
