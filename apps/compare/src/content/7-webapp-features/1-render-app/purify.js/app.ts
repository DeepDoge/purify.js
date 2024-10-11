import { fragment, tags } from "@purifyjs/purify";

const { div, h1 } = tags;

export function App() {
	const host = div().id("app");
	const shadow = host.element.attachShadow({
		mode: "open",
	});
	shadow.append(fragment(h1().children("Hello World")));

	return host;
}

document.body.append(App().element);
