/**
 * @param {TemplateStringsArray} strings
 * @param {{}[]} values
 * @constant
 */
export let css = String.raw
/**
 * @param {string} css
 */
export let sheet = (css) => {
    let sheet = new CSSStyleSheet()
    sheet.replaceSync(css)
    return sheet
}
css = String
