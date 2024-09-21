import { fragment, tags } from "purify-js";

const { h1 } = tags;

export function App() {
	return fragment(h1().children("Hello World"));
}

document.body.append(App());
