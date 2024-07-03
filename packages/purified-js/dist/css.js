/**
 * A function to create a raw string for CSS styles.
 *
 * @example
 * ```typescript
 * let myCss = css`
 *   body {
 *     background-color: red;
 *   }
 * `;
 * ```
 */
export let css = String.raw;
/**
 * A function to create or replace a CSSStyleSheet with a given CSS string.
 *
 * @param css - The CSS string to be used.
 * @param sheet - The CSSStyleSheet to be replaced. If not provided, a new CSSStyleSheet will be created.
 * @returns The replaced or newly created CSSStyleSheet.
 *
 * @example
 * ```typescript
 * let mySheet = sheet(css`
 *   body {
 *     background-color: red;
 *   }
 * `);
 * ```
 */
export let sheet = (css, sheet = new CSSStyleSheet()) => {
    sheet.replaceSync(css);
    return sheet;
};
