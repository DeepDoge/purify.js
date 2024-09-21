import { ref, tags } from "purify-js";

const { p } = tags;

export function Time() {
	const host = p();

	const time = ref(new Date().toLocaleTimeString());
	host.element.onConnect(() => {
		const interval = setInterval(() => {
			time.val = new Date().toLocaleTimeString();
		}, 1000);
		return () => clearInterval(interval);
	});

	return host.children("Current time: ", time);
}
