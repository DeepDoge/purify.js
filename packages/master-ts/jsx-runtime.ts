import { type Template } from "."

/* 
    TODO: Simple enough for now but later can be improved
*/

type TagNameMap = SVGElementTagNameMap &
    MathMLElementTagNameMap &
    HTMLElementTagNameMap & { [key: string]: Element }

export namespace JSX {
    export type IntrinsicElements = {
        [K in keyof TagNameMap]: Template.Attributes<TagNameMap[K]>
    }
    export type Element = string
}

type ChildrenProp = { children?: JSX.Element | JSX.Element[] }
type Props<T extends Element> = Template.Attributes<T> & ChildrenProp
type Factory<TProps extends ChildrenProp = ChildrenProp, TReturn = unknown> = {
    (props: TProps): TReturn
}

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
    return `<${name}${Object.entries(attr)
        .map((attr) => ` ${attr[0]}="${attr[1]}"`)
        .join("")}>${
        children ? (Array.isArray(children) ? children.join("") : children) : ""
    }</${name}>`
}
export const jsxDEV = jsx

export function Fragment({ children }: ChildrenProp) {
    return children ? (Array.isArray(children) ? children.join("") : children) : ""
}
