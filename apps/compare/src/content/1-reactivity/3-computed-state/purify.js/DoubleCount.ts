import { computed, ref, tags } from "purify-js";

const { div } = tags;

export function Name() {
	const count = ref(10);
	const doubleCount = computed(() => count.val * 2);

	return div().children(doubleCount);
}
