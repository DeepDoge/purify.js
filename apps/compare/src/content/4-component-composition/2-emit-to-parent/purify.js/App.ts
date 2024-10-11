import { fragment, ref, tags } from "@purifyjs/purify";
import { AnswerButton } from "./AnswerButton";

const { p } = tags;

export function App() {
	const isHappy = ref(true);

	function onAnswerNo() {
		isHappy.val = false;
	}

	function onAnswerYes() {
		isHappy.val = true;
	}

	return fragment(
		p().children("Are you happy?"),
		AnswerButton({
			onYes: onAnswerYes,
			onNo: onAnswerNo,
		}),
		p({ style: "font-size: 5em" }).children(
			isHappy.derive((isHappy) =>
				isHappy ? "😀" : "😥",
			),
		),
	);
}
