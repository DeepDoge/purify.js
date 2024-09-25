import { fragment, readonly, tags } from "purify-js";

const { p } = tags;

export function PageTitleAlternative() {
	const host = p();
	const shadow = host.element.attachShadow({
		mode: "open",
	});
	shadow.append(fragment(title));
	return host;
}

const title = readonly<string>((follower, immediate) => {
	if (immediate) {
		follower(document.title);
	}

	document.title ||= "";
	const titleElement = document.querySelector("title")!;

	const observer = new MutationObserver((mutations) =>
		follower(mutations[0].target.nodeValue ?? ""),
	);

	observer.observe(titleElement, {
		subtree: true,
		characterData: true,
		childList: true,
	});

	return () => {
		observer.disconnect();
	};
});
