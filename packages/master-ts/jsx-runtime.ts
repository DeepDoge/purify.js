import { fragment, populate, type Template } from "."

// It looks like JSX is not simple and cool as I thought it was.
// It could have been better but its very limited and really looks like a spaghetti on the TypeScript side.
// Looks like type system for it designed by someone who has no idea about TypeScript.

// Anyway, we support it now, but typing still sucks with them, its still recommended that you use `tags` Proxy.
// But this might still be usefull.

export namespace JSX {
    export type IntrinsicElements = {
        [K in keyof HTMLElementTagNameMap]: Template.Attributes<HTMLElementTagNameMap[K]>
    } & {
        [unknownTag: string]: Template.Attributes<Element>
    }
    export type Element = HTMLElementTagNameMap[keyof HTMLElementTagNameMap]
}

type ChildrenProp = { children?: Template.Member[] | Template.Member }
type Props<T extends HTMLElement> = Template.Attributes<T> & ChildrenProp
type Factory<TProps extends ChildrenProp = ChildrenProp, TReturn = unknown> = { (props: TProps): TReturn }

// TS doesn't care about the types here
export function jsx<T extends Factory>(
    ...args: [name: string, props: Props<HTMLElement>] | [factory: T, props: Parameters<T>[0]]
): unknown {
    if (typeof args[0] === "function") {
        const [factory, props] = args as Extract<typeof args, [Function, ...any]>
        return factory(props)
    }

    const [name, props] = args as Extract<typeof args, [string, ...any]>
    const { children, ...attr } = props
    const element = document.createElement(name)
    populate(element, attr as never, children ? (Array.isArray(children) ? children : [children]) : [])
    return element
}
export const jsxDEV = jsx

export function Fragment({ children }: ChildrenProp) {
    return children ? (Array.isArray(children) ? fragment(...children) : children) : fragment()
}
