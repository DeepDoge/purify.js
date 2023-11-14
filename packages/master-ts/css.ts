export let css = (strings: TemplateStringsArray, ...values: {}[]) => String.raw(strings, ...values)
export let sheet = (css: string) => {
    let sheet = new CSSStyleSheet()
    sheet.replaceSync(css)
    return sheet
}

/* export let style = (style: Style): string => {
    type Value = { [key: string]: string | Value }
    let toString = (value: Value): string =>
        Object.entries(value)
            .map(([key, value]) => (typeof value === "string" ? `${key}:${value};` : `${key}{${toString(value)}}`))
            .join("")
    return toString(style)
}

export type Style = Style.AtRule | Style.Rule
export namespace Style {
    export type AtRule =
        | {
              [K in `@${"media" | "scope" | "supports" | "page" | "font-face" | "keyframes" | "counter-style"}`]: Rule
          }
        | {
              [key: `@${string}${string}`]: Rule
          }

    export type Rule =
        | {
              [K in ":scope" | ":root" | ":host" | "body" | "head" | "*" | "html"]: Declaration
          }
        | {
              [key: `${"#" | "." | ":" | "*" | Utils.AsciiLetter}${string}${string}`]: Rule.Member
          }
    export namespace Rule {
        export type Nested = {
            [key: `&${string}`]: Member
        }
        export type Member = Declaration | Nested
    }

    export type Declaration =
        | ({
              [K in keyof CSSStyleDeclaration as K extends string
                  ? CSSStyleDeclaration[K] extends string | number
                      ? Utils.Kebab<K>
                      : never
                  : never]?: string
          } & Partial<{
              display: // precomposed values
              | "block"
                  | "inline"
                  | "inline-block"
                  | "flex"
                  | "inline-flex"
                  | "grid"
                  | "inline-grid"
                  | "flow-root"
                  // box generation
                  | "none"
                  | "contents"
                  // multi-keyword syntax
                  | `${"block" | "inline"} ${"flow" | "flow-root" | "table" | "flex" | "grid"}`
                  // other values
                  | "table"
                  | "table-row"
                  | "table-cell"
                  | "list-item"
              width: Size
              height: Size
              "min-width": Size
              "min-height": Size
              "max-width": Size
              "max-height": Size
              top: Size
              left: Size
              right: Size
              bottom: Size
          }>)
        | {
              [key: `${string}${string}`]: "inherit" | "initial" | "revert" | "revert-layer" | "unset" | (string & {})
          }

    export type Size =
        | `${number}${
              | "px"
              | "em"
              | "rem"
              | "vh"
              | "vw"
              | "dvw"
              | "dvh"
              | "vmin"
              | "vmax"
              | "cm"
              | "mm"
              | "in"
              | "pt"
              | "pc"
              | "ch"
              | "ex"
              | "fr"
              | "%"}`
        | "auto"
}
 */
