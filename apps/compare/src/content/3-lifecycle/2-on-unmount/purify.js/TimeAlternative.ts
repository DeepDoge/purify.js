import { fragment, readonly, tags } from "purify-js";

const { p } = tags;

export function TimeAlternative() {
	const host = p();
	const shadow = host.element.attachShadow({
		mode: "open",
	});
	shadow.append(fragment("Current time: ", time));

	return host;
}

const time = readonly<string>((follower, immediate) => {
	if (immediate) {
		follower(new Date().toLocaleTimeString());
	}

	const interval = setInterval(() => {
		follower(new Date().toLocaleTimeString());
	}, 1000);

	return () => clearInterval(interval);
});
