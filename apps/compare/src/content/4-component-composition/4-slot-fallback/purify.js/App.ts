import { fragment } from "purify-js";
import { FunnyButton } from "./FunnyButton";
import { FunnyButton2 } from "./FunnyButton2";

export function App() {
	return fragment(
		FunnyButton(),
		FunnyButton().children("I got content!"),
		FunnyButton2(),
		FunnyButton2("I got content!"),
	);
}
