export let css = (strings: TemplateStringsArray, ...values: string[]) => {
	const sheet = new CSSStyleSheet()
	sheet.replaceSync(String.raw(strings, ...values))
	return sheet
}
