import { fragment, tags } from "purify-js";
import { UserProfile } from "./UserProfile";

const { div } = tags;

export function App() {
	const host = div().id("app");
	const shadow = host.element.attachShadow({
		mode: "open",
	});

	shadow.append(
		fragment(
			UserProfile({
				name: "John",
				age: 30,
				favouriteColors: ["red", "green", "blue"],
				isAvailable: true,
			}),
		),
	);

	return host;
}
