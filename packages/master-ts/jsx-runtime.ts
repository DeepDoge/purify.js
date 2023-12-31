import type { Template } from "./template"

/* 
    TODO: Simple enough for now but later can be improved
    JSX itself is kinda limited and bad, like its designed by someone who understand typescript.
    So that's why im only using jsx for rendering raw html atm. no directives or anything.
    Just raw html.
    Or xml, or whatever.
*/

type TagNameMap = SVGElementTagNameMap &
    MathMLElementTagNameMap &
    HTMLElementTagNameMap & { [key: string]: Element }

export namespace JSX {
    export type IntrinsicElements = {
        [K in keyof TagNameMap]: Template.Attributes<TagNameMap[K]>
    }
    export type Element = {
        readonly xml: string
        render(): TagNameMap[keyof TagNameMap]
        [Symbol.toPrimitive](): string
    }
}

type ChildrenProp = { children?: JSX.Element | JSX.Element[] }
type Props<T extends Element> = Template.Attributes<T> & ChildrenProp
type Factory<TProps extends ChildrenProp = ChildrenProp, TReturn = unknown> = {
    (props: TProps): TReturn
}

let template = document.createElement("template")

// TS doesn't care about the types here
export function jsx<T extends Factory>(
    ...args:
        | [name: string, props: Props<TagNameMap[keyof TagNameMap]>]
        | [factory: T, props: Parameters<T>[0]]
): unknown {
    if (typeof args[0] === "function") {
        throw new Error("Factory components are not supported")
    }

    const [name, props] = args as Extract<typeof args, [string, ...any]>
    const { children, ...attr } = props

    const xml = `<${name}${Object.entries(attr)
        .map((attr) => ` ${attr[0]}="${attr[1]}"`)
        .join("")}>${
        children ? (Array.isArray(children) ? children.join("") : children) : ""
    }</${name}>`

    return {
        xml,
        render() {
            template.innerHTML = xml.toString()
            return template.content.firstElementChild!
        },
        [Symbol.toPrimitive]() {
            return xml
        },
    } satisfies JSX.Element
}
export const jsxDEV = jsx

export function Fragment({ children }: ChildrenProp) {
    const xml = children
        ? Array.isArray(children)
            ? children.join("")
            : String(children)
        : ""
    return {
        xml,
        render() {
            template.innerHTML = xml.toString()
            return template.content.cloneNode(true) as typeof template.content
        },
        [Symbol.toPrimitive]() {
            return xml
        },
    } satisfies Omit<JSX.Element, "render"> & { render(): DocumentFragment }
}
