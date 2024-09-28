import { Signal } from "./signals.js";
type Not<T extends boolean> = false extends T ? true : false;
type IsReadonly<T, K extends keyof T> = (<T_1>() => T_1 extends {
    [Q in K]: T[K];
} ? 1 : 2) extends <T_2>() => T_2 extends {
    readonly [Q_1 in K]: T[K];
} ? 1 : 2 ? true : false;
type IsFunction<T> = T extends Fn ? true : false;
type Fn = (...args: any[]) => any;
type IsEventHandler<T, K extends keyof T> = NonNullable<T[K]> extends (this: any, event: infer U) => any ? U extends Event ? K extends `on${any}` ? true : false : false : false;
/**
 * Creates a DocumentFragment containing the provided members.
 *
 * @param members - The members to append to the fragment.
 * @returns  The created DocumentFragment.
 * @example
 * let frag = fragment(
 *      document.createElement('div'),
 *      div(),
 *      computed(() => count.val * 2),
 *      'Text content'
 * );
 */
export declare let fragment: (...members: MemberOf<DocumentFragment>[]) => DocumentFragment;
export declare let toAppendable: (value: unknown) => string | CharacterData | Element | DocumentFragment;
export type Enhanced<T extends HTMLElement = HTMLElement> = T & {
    onConnect(callback: Enhanced.ConnectedCallback<Enhanced<T>>): Enhanced.OffConnected;
};
export declare namespace Enhanced {
    type OffConnected = () => void;
    type DisconnectedCallback = () => void;
    type ConnectedCallback<T extends Enhanced> = (element: T) => void | DisconnectedCallback;
}
export type Tags = {
    [K in keyof HTMLElementTagNameMap]: (attributes?: {
        [name: string]: Builder.AttributeValue<Enhanced<HTMLElementTagNameMap[K]>>;
    }) => Builder.Proxy<Enhanced<HTMLElementTagNameMap[K]>>;
};
/**
 * Proxy object for building HTML elements.
 *
 * It separates attributes and properties.

 * @example
 * let { div, span } = tags;
 *
 * ```ts
 * div({ class: 'hello', 'aria-hidden': 'false' })
 *  .id("my-div")
 *  .ariaLabel("Hello, World!")
 *  .onclick(() => console.log('clicked!'))
 *  .children(span('Hello, World!'));
 * ```
 *
 * Also allows signals as properties or attributes:
 * ```ts
 * div({ class: computed(() => count.val & 1 ? 'odd' : 'even') })
 *  .onclick(computed(() =>
 *      count.val & 1 ?
 *          () => alert('odd') :
 *          () => alert('even')
 *  ))
 *  .children("Click me!");
 * ```
 */
export declare let tags: Tags;
/**
 * Builder class to construct a builder to populate an element with attributes and children.
 */
export declare class Builder<T extends Enhanced> {
    readonly element: T;
    /**
     * Creates a builder for the given element.
     *
     * @param element - The element to build.
     * @example
     * new Builder(myDiv)
     *  .attributes({ class: 'hello', 'aria-hidden': 'false' })
     *  .children(span('Hello, World!'));
     */
    constructor(element: T);
    use(callback: Enhanced.ConnectedCallback<T>): this;
    children(...members: MemberOf<T>[]): this;
    attributes(attributes: Record<string, Builder.AttributeValue<T>>): this;
    /**
     * Creates a proxy for a `Builder` instance.
     * Which allows you to also set properties.
     *
     * @param element - The element to manage.
     * @returns The proxy for the Builder instance.
     *
     * @example
     * Builder.Proxy(myDiv)
     *  .attributes({ class: 'hello', 'aria-hidden': 'false' })
     *  .children(span('Hello, World!'));
     *  .onclick(() => console.log('clicked!'));
     *  .ariaLabel("Hello, World!");
     */
    static Proxy: <T_1 extends Enhanced>(element: T_1) => Builder.Proxy<T_1>;
}
export declare namespace Builder {
    type AttributeValue<T extends Element> = string | number | boolean | bigint | null | (T extends Enhanced ? Signal<AttributeValue<T>> : never);
    type Proxy<T extends Enhanced> = Builder<T> & {
        [K in keyof T as true extends [IsEventHandler<T, K>, Not<IsFunction<T[K]>> & Not<IsReadonly<T, K>>][number] ? K : never]: T[K] extends (...args: infer Args) => void ? (...args: Args) => Proxy<T> : (value: NonNullable<T[K]> extends (this: infer X, event: infer U) => infer R ? U extends Event ? (this: X, event: U & {
            currentTarget: T;
        }) => R : T[K] : T[K] | Signal<T[K]>) => Proxy<T>;
    };
}
export type ChildNodeOf<TParentNode extends ParentNode> = DocumentFragment | CharacterData | (TParentNode extends SVGElement ? TParentNode extends SVGForeignObjectElement ? Element : SVGElement : TParentNode extends HTMLElement ? Element : TParentNode extends MathMLElement ? MathMLElement : Element);
export type MemberOf<T extends ParentNode> = string | number | boolean | bigint | null | ChildNodeOf<T> | (HTMLElement extends ChildNodeOf<T> ? Builder<Enhanced> : never) | MemberOf<T>[] | Signal<MemberOf<T>>;
export {};
