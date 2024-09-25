import { fragment } from "purify-js";
import { FunnyButton } from "./FunnyButton";
import { FunnyButtonAlternative } from "./FunnyButtonAlternative";

export function App() {
	return fragment(
		FunnyButton(),
		FunnyButton().children("I got content!"),
		FunnyButtonAlternative(),
		FunnyButtonAlternative("I got content!"),
	);
}
