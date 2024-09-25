import { computed, ref, tags } from "purify-js";

const { div } = tags;

export function DoubleCountAlternative() {
	const count = ref(10);
	const doubleCount = computed(
		() => count.val * 2,
		[count],
	);

	return div().children(doubleCount);
}
