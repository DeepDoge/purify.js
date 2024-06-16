export function fragment(...members: import("./tags.js").MemberOf<DocumentFragment>[]): DocumentFragment;
export function toAppendable(value: unknown): string | CharacterData | Element | DocumentFragment;
export class SignalElement extends HTMLElement {
    /**
     * @param {typeof this.$signal} signal
     */
    constructor(signal: typeof this.$signal);
    /** @type {Signal<*>} */
    $signal: Signal<any>;
    /** @type {import('./signals.js').Signal.Unfollower | undefined} */
    $unfollow: import('./signals.js').Signal.Unfollower | undefined;
    connectedCallback(self?: this): void;
    disconnectedCallback(): void;
}
/**
 *
 * @template {Element} T
 * @typedef EventMap
 * @type {T extends HTMLElement ? HTMLElementEventMap :
 *          T extends SVGElement ? SVGElementEventMap :
 *          T extends MathMLElement ? MathMLElementEventMap :
 *          ElementEventMap
 * }
 */
/**
 * @template {Element} T
 * @typedef ToBuilderFunctions
 * @type {{
 *   [K in keyof T as
 *      true extends (
 *          | import("./utils.js").IsReadonly<T, K>
 *          | (import("./utils.js").IsFunction<T[K]> & import("./utils.js").NotEventHandler<T[K]>)
 *      ) ? never : K]:
 *      (
 *          value:
 *              NonNullable<T[K]> extends (this: infer X, event: infer U) => infer R ? U extends Event ?
 *                  (this: X, event: U & { currentTarget: T }) => R
 *              : T[K]
 *              : T[K]
 *      ) => Builder<T> & ToBuilderFunctions<T>
 * }}
 */
/**
 * @type {{
 *    [K in keyof HTMLElementTagNameMap]:
 *       (
 *          attributes?: { [name: string]: string | number | boolean | bigint | null }) =>
 *              Builder<HTMLElementTagNameMap[K]> & ToBuilderFunctions<HTMLElementTagNameMap[K]>
 * }}
 */
export const tags: {
    a: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLAnchorElement> & ToBuilderFunctions<HTMLAnchorElement>;
    abbr: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    address: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    area: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLAreaElement> & ToBuilderFunctions<HTMLAreaElement>;
    article: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    aside: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    audio: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLAudioElement> & ToBuilderFunctions<HTMLAudioElement>;
    b: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    base: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLBaseElement> & ToBuilderFunctions<HTMLBaseElement>;
    bdi: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    bdo: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    blockquote: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLQuoteElement> & ToBuilderFunctions<HTMLQuoteElement>;
    body: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLBodyElement> & ToBuilderFunctions<HTMLBodyElement>;
    br: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLBRElement> & ToBuilderFunctions<HTMLBRElement>;
    button: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLButtonElement> & ToBuilderFunctions<HTMLButtonElement>;
    canvas: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLCanvasElement> & ToBuilderFunctions<HTMLCanvasElement>;
    caption: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLTableCaptionElement> & ToBuilderFunctions<HTMLTableCaptionElement>;
    cite: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    code: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    col: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLTableColElement> & ToBuilderFunctions<HTMLTableColElement>;
    colgroup: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLTableColElement> & ToBuilderFunctions<HTMLTableColElement>;
    data: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLDataElement> & ToBuilderFunctions<HTMLDataElement>;
    datalist: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLDataListElement> & ToBuilderFunctions<HTMLDataListElement>;
    dd: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    del: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLModElement> & ToBuilderFunctions<HTMLModElement>;
    details: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLDetailsElement> & ToBuilderFunctions<HTMLDetailsElement>;
    dfn: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    dialog: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLDialogElement> & ToBuilderFunctions<HTMLDialogElement>;
    div: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLDivElement> & ToBuilderFunctions<HTMLDivElement>;
    dl: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLDListElement> & ToBuilderFunctions<HTMLDListElement>;
    dt: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    em: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    embed: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLEmbedElement> & ToBuilderFunctions<HTMLEmbedElement>;
    fieldset: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLFieldSetElement> & ToBuilderFunctions<HTMLFieldSetElement>;
    figcaption: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    figure: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    footer: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    form: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLFormElement> & ToBuilderFunctions<HTMLFormElement>;
    h1: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLHeadingElement> & ToBuilderFunctions<HTMLHeadingElement>;
    h2: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLHeadingElement> & ToBuilderFunctions<HTMLHeadingElement>;
    h3: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLHeadingElement> & ToBuilderFunctions<HTMLHeadingElement>;
    h4: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLHeadingElement> & ToBuilderFunctions<HTMLHeadingElement>;
    h5: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLHeadingElement> & ToBuilderFunctions<HTMLHeadingElement>;
    h6: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLHeadingElement> & ToBuilderFunctions<HTMLHeadingElement>;
    head: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLHeadElement> & ToBuilderFunctions<HTMLHeadElement>;
    header: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    hgroup: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    hr: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLHRElement> & ToBuilderFunctions<HTMLHRElement>;
    html: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLHtmlElement> & ToBuilderFunctions<HTMLHtmlElement>;
    i: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    iframe: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLIFrameElement> & ToBuilderFunctions<HTMLIFrameElement>;
    img: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLImageElement> & ToBuilderFunctions<HTMLImageElement>;
    input: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLInputElement> & ToBuilderFunctions<HTMLInputElement>;
    ins: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLModElement> & ToBuilderFunctions<HTMLModElement>;
    kbd: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    label: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLLabelElement> & ToBuilderFunctions<HTMLLabelElement>;
    legend: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLLegendElement> & ToBuilderFunctions<HTMLLegendElement>;
    li: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLLIElement> & ToBuilderFunctions<HTMLLIElement>;
    link: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLLinkElement> & ToBuilderFunctions<HTMLLinkElement>;
    main: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    map: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLMapElement> & ToBuilderFunctions<HTMLMapElement>;
    mark: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    menu: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLMenuElement> & ToBuilderFunctions<HTMLMenuElement>;
    meta: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLMetaElement> & ToBuilderFunctions<HTMLMetaElement>;
    meter: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLMeterElement> & ToBuilderFunctions<HTMLMeterElement>;
    nav: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    noscript: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    object: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLObjectElement> & ToBuilderFunctions<HTMLObjectElement>;
    ol: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLOListElement> & ToBuilderFunctions<HTMLOListElement>;
    optgroup: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLOptGroupElement> & ToBuilderFunctions<HTMLOptGroupElement>;
    option: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLOptionElement> & ToBuilderFunctions<HTMLOptionElement>;
    output: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLOutputElement> & ToBuilderFunctions<HTMLOutputElement>;
    p: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLParagraphElement> & ToBuilderFunctions<HTMLParagraphElement>;
    picture: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLPictureElement> & ToBuilderFunctions<HTMLPictureElement>;
    pre: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLPreElement> & ToBuilderFunctions<HTMLPreElement>;
    progress: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLProgressElement> & ToBuilderFunctions<HTMLProgressElement>;
    q: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLQuoteElement> & ToBuilderFunctions<HTMLQuoteElement>;
    rp: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    rt: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    ruby: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    s: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    samp: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    script: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLScriptElement> & ToBuilderFunctions<HTMLScriptElement>;
    search: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    section: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    select: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLSelectElement> & ToBuilderFunctions<HTMLSelectElement>;
    slot: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLSlotElement> & ToBuilderFunctions<HTMLSlotElement>;
    small: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    source: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLSourceElement> & ToBuilderFunctions<HTMLSourceElement>;
    span: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLSpanElement> & ToBuilderFunctions<HTMLSpanElement>;
    strong: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    style: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLStyleElement> & ToBuilderFunctions<HTMLStyleElement>;
    sub: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    summary: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    sup: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    table: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLTableElement> & ToBuilderFunctions<HTMLTableElement>;
    tbody: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLTableSectionElement> & ToBuilderFunctions<HTMLTableSectionElement>;
    td: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLTableCellElement> & ToBuilderFunctions<HTMLTableCellElement>;
    template: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLTemplateElement> & ToBuilderFunctions<HTMLTemplateElement>;
    textarea: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLTextAreaElement> & ToBuilderFunctions<HTMLTextAreaElement>;
    tfoot: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLTableSectionElement> & ToBuilderFunctions<HTMLTableSectionElement>;
    th: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLTableCellElement> & ToBuilderFunctions<HTMLTableCellElement>;
    thead: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLTableSectionElement> & ToBuilderFunctions<HTMLTableSectionElement>;
    time: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLTimeElement> & ToBuilderFunctions<HTMLTimeElement>;
    title: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLTitleElement> & ToBuilderFunctions<HTMLTitleElement>;
    tr: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLTableRowElement> & ToBuilderFunctions<HTMLTableRowElement>;
    track: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLTrackElement> & ToBuilderFunctions<HTMLTrackElement>;
    u: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    ul: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLUListElement> & ToBuilderFunctions<HTMLUListElement>;
    var: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
    video: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLVideoElement> & ToBuilderFunctions<HTMLVideoElement>;
    wbr: (attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    }) => Builder<HTMLElement> & ToBuilderFunctions<HTMLElement>;
};
/**
 * @template {Element & ParentNode} T
 */
export class Builder<T extends Element & ParentNode> {
    /**
     * @param {T} element
     * @param {{ [name: string]: string | number | boolean | bigint | null }} attributes
     */
    constructor(element: T, attributes?: {
        [name: string]: string | number | boolean | bigint | null;
    });
    /** @type {T} */
    element: T;
    /** @param {MemberOf<T>[]} members */
    children(...members: MemberOf<T>[]): this;
}
export type ChildNodeOf<TParentNode extends ParentNode> = any | DocumentFragment | CharacterData | (TParentNode extends SVGElement ? SVGElement : TParentNode extends HTMLElement ? Element : TParentNode extends MathMLElement ? MathMLElement : Element);
export type MemberOf<T extends ParentNode> = string | number | boolean | bigint | null | ChildNodeOf<T> | Builder<any> | import("./signals.js").Signal<any>;
export type EventMap<T extends Element> = T extends HTMLElement ? HTMLElementEventMap : T extends SVGElement ? SVGElementEventMap : T extends MathMLElement ? MathMLElementEventMap : ElementEventMap;
export type ToBuilderFunctions<T extends Element> = { [K in keyof T as true extends import("./utils.js").IfEquals<{ [Q in K]: T[K]; }, { readonly [Q_1 in K]: T[K]; }, true, false> | (import("./utils.js").IsFunction<T[K]> & import("./utils.js").NotEventHandler<T[K]>) ? never : K]: (value: NonNullable<T[K]> extends (this: infer X, event: infer U) => infer R ? U extends Event ? (this: X, event: U & {
    currentTarget: T;
}) => R : T[K] : T[K]) => Builder<T> & ToBuilderFunctions<T>; };
import { Signal } from "./signals";
