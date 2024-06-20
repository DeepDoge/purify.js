export let css = String.raw;
export let sheet = (css, sheet = new CSSStyleSheet()) => (sheet.replaceSync(css), sheet);
