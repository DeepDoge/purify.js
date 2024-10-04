import { computed, ref, tags } from "purify-js";

const { div } = tags;

export function DoubleCountAlternative() {
	const count = ref(10);
	const doubleCount = computed(
		(add) => add(count).val * 2,
	);

	return div().children(doubleCount);
}
