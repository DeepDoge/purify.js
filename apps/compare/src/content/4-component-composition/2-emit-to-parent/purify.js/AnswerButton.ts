import { fragment, tags } from "purify-js";

const { button } = tags;

export function AnswerButton(params: {
	onYes: () => void;
	onNo: () => void;
}) {
	return fragment(
		button().onclick(params.onYes).children("Yes"),
		button().onclick(params.onNo).children("No"),
	);
}
