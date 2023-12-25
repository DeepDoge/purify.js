export let css = (strings: TemplateStringsArray, ...values: {}[]) => String.raw(strings, ...values)
export let sheet = (css: string) => {
    let sheet = new CSSStyleSheet()
    sheet.replaceSync(css)
    return sheet
}
