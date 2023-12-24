import { fragment, populate, type Template } from "."

export namespace JSX {
    export type IntrinsicElements = {
        [K in keyof HTMLElementTagNameMap]: Template.Attributes<HTMLElementTagNameMap[K]>
    }
}

type ChildrenProp = { children?: Template.Member[] | Template.Member }
type Factory = { (props: Template.Attributes<Element> & ChildrenProp): unknown }

export function jsx<K extends keyof HTMLElementTagNameMap, TInputType extends HTMLInputElement["type"]>(
    name: K,
    props: Template.Attributes<HTMLElementTagNameMap[K], TInputType> & ChildrenProp
): HTMLElementTagNameMap[K]
export function jsx(name: string, props: Template.Attributes<HTMLElement> & ChildrenProp): Element
export function jsx(factory: Factory, props: ChildrenProp): ReturnType<Factory>
export function jsx(nameOrFactory: string | Factory, props: Template.Attributes<Element> & ChildrenProp): unknown {
    if (typeof nameOrFactory === "function") return nameOrFactory(props)

    const element = document.createElement(nameOrFactory)
    const content = props.children
    delete props.children
    populate(element, props, content ? (Array.isArray(content) ? content : [content]) : [])
    return element
}
export const jsxDEV = jsx

export function Fragment({ children }: ChildrenProp) {
    return children ? (Array.isArray(children) ? fragment(...children) : children) : fragment()
}
