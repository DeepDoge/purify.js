import { fragment, tags } from "purify-js";

const { div, p } = tags;

export function UserProfile({
	name = "",
	age = 0,
	favouriteColors = [] as string[],
	isAvailable = false,
}) {
	const host = div();
	const shadow = host.element.attachShadow({
		mode: "open",
	});

	shadow.append(
		fragment(
			p().children("My name is ", name),
			p().children("My age is ", age),
			p().children(
				"My favourite colors are ",
				favouriteColors.join(", "),
			),
			p().children(
				"I am ",
				isAvailable ? "available" : "not available",
			),
		),
	);

	return host;
}
