import { fragment, ref, tags } from "@purifyjs/core";

const { p } = tags;

export function TimeAlternative() {
	const host = p();
	const shadow = host.element.attachShadow({
		mode: "open",
	});
	shadow.append(fragment("Current time: ", time));

	return host;
}

const time = ref("", (set) => {
	const interval = setInterval(() => {
		set(new Date().toLocaleTimeString());
	}, 1000);

	set(new Date().toLocaleTimeString());
	return () => clearInterval(interval);
});
