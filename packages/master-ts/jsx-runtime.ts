import { fragment, populate, type Template } from "."

// It looks like JSX is not simple and cool as I thought it was.
// It could have been better but its very limited and really looks like a spaghetti on the TypeScript side.
// Looks like type system for it designed by someone who has no idea about TypeScript.

// Anyway, we support it now, but typing still sucks with them, its still recommended that you use `tags` Proxy.
// But this might still be usefull.

type DomElement = Element

export namespace JSX {
    type TagNameMap = SVGElementTagNameMap &
        MathMLElementTagNameMap &
        HTMLElementTagNameMap & { [key: string]: DomElement }

    export type IntrinsicElements = {
        [K in keyof TagNameMap]: Template.Attributes<TagNameMap[K]>
    } & {
        [unknownTag: string]: Template.Attributes<Element>
    }
    export type Element = TagNameMap[keyof TagNameMap]
}

type ChildrenProp = { children?: Template.Member[] | Template.Member }
type Props<T extends Element> = Template.Attributes<T> & ChildrenProp
type Factory<TProps extends ChildrenProp = ChildrenProp, TReturn = unknown> = {
    (props: TProps): TReturn
}

const template = document.createElement("template")

// TS doesn't care about the types here
export function jsx<T extends Factory>(
    ...args:
        | [name: string, props: Props<JSX.Element>]
        | [factory: T, props: Parameters<T>[0]]
): unknown {
    if (typeof args[0] === "function") {
        const [factory, props] = args as Extract<typeof args, [Function, ...any]>
        return factory(props)
    }

    const [name, props] = args as Extract<typeof args, [string, ...any]>
    const { children, ...attr } = props
    // We are not using `createElement` because it assumes everything is a HTMLElement
    template.innerHTML = `<${name}></${name}>`
    const element = template.content.firstElementChild as Element
    element.remove()
    populate(
        element,
        attr,
        children ? (Array.isArray(children) ? children : [children]) : [],
    )
    return element
}
export const jsxDEV = jsx

export function Fragment({ children }: ChildrenProp) {
    return children
        ? Array.isArray(children)
            ? fragment(...children)
            : children
        : fragment()
}
