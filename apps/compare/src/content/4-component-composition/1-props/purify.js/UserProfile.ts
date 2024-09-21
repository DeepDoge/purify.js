import { fragment, tags } from "purify-js";

const { p } = tags;

export function UserProfile({
	name = "",
	age = 0,
	favouriteColors = [] as string[],
	isAvailable = false,
}) {
	return fragment(
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
	);
}
