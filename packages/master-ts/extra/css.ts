import { $ } from "../core"

export interface CssTemplate {
	readonly raw: string
	toStyle(): HTMLStyleElement
	toSheet(): CSSStyleSheet
}

export let css = (strings: TemplateStringsArray, ...values: {}[]): CssTemplate => {
	let raw = String.raw(strings, ...values)
	return {
		raw,
		toStyle: () => $.style({}, [raw]),
		toSheet() {
			let sheet = new CSSStyleSheet()
			sheet.replaceSync(raw)
			return sheet
		}
	}
}
