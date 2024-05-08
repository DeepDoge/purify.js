/**
 * @param {TemplateStringsArray} strings
 * @param {{}[]} values
 */
export let css = (strings, ...values) => String.raw(strings, ...values)
/**
 * @param {string} css
 */
export let sheet = (css) => {
    let sheet = new CSSStyleSheet()
    sheet.replaceSync(css)
    return sheet
}
