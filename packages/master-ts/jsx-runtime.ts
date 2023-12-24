import { fragment, populate, type Template } from "."

export namespace JSX {
    export type IntrinsicElements = {
        [K in keyof HTMLElementTagNameMap]: Template.Attributes<HTMLElementTagNameMap[K]>
    }
}

type ChildrenProp = { children?: Template.Member[] | Template.Member }
type Factory = { (props: Template.Attributes<Element> & ChildrenProp): unknown }
// type FactoryProps<T extends Factory> = ChildrenProp & { $: Parameters<T> } // TypeScript doesn't care about this :/

export function jsx<K extends keyof HTMLElementTagNameMap, TInputType extends HTMLInputElement["type"]>(
    name: K,
    props: Template.Attributes<HTMLElementTagNameMap[K], TInputType> & ChildrenProp
): HTMLElementTagNameMap[K]
export function jsx(name: string, props: Template.Attributes<HTMLElement> & ChildrenProp): Element
// export function jsx<T extends Factory>(factory: T, props: FactoryProps<T>): ReturnType<Factory> // TypeScript doesn't care about this :/
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
