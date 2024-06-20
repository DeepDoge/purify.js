export let css = String.raw
export let sheet = (css: string, sheet = new CSSStyleSheet()) => (
    sheet.replaceSync(css), sheet
)
