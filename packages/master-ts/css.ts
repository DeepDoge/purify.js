import { Utils } from "./utils"

export let css = (strings: TemplateStringsArray, ...values: {}[]) => String.raw(strings, ...values)
export let sheet = (css: string) => {
    let sheet = new CSSStyleSheet()
    sheet.replaceSync(css)
    return sheet
}

export let style = <const T extends Style>(style: T): string => {
    type Value = { [key: string]: string | Value }
    let toString = (value: Value): string =>
        Object.entries(value)
            .map(([key, value]) => (typeof value === "string" ? `${key}:${value};` : `${key}{${toString(value)}}`))
            .join("")
    return toString(style)
}

style({
    "@scope": {
        ":scope": {
            display: "block",
            width: "100%",
            "accent-color": "var(--accent-color)"
        },
        ".items": {
            display: "grid",
            "grid-template-columns": "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "1rem",

            "& .item": {
                display: "grid",
                "grid-template-columns": "1fr"
            }
        }
    }
})

export type Style = Style.Rule | Style.Selectors
export namespace Style {
    export type Rule = {
        [key: `@${string}`]: Selectors
    }

    export type Selectors = {
        [key: `${"#" | "." | ":" | Utils.AsciiLetter}${string}${string}`]: Selectors.Member
    }
    export namespace Selectors {
        export type Member = Declarations | Nested
        export type Nested = {
            [key: `&${string}`]: Member
        }
    }

    export type Declarations =
        | ({
              [K in keyof CSSStyleDeclaration as K extends string
                  ? CSSStyleDeclaration[K] extends string | number
                      ? Utils.Kebab<K>
                      : never
                  : never]?: string
          } & Partial<{
              display: /* precomposed values */
              | "block"
                  | "inline"
                  | "inline-block"
                  | "flex"
                  | "inline-flex"
                  | "grid"
                  | "inline-grid"
                  | "flow-root"
                  /* box generation */
                  | "none"
                  | "contents"
                  /* multi-keyword syntax */
                  | `${"block" | "inline"} ${"flow" | "flow-root" | "table" | "flex" | "grid"}`
                  /* other values */
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
