import { Tags } from "./tags"

export namespace CustomTag {
    export type TagName = `${string}${string}-${string}${string}`
}
export let customTag: {
    (tag: CustomTag.TagName): Tags.Builder<HTMLElement>
    <T extends keyof HTMLElementTagNameMap>(
        tag: CustomTag.TagName,
        extendsTag: T,
        extendsElement: { new (): HTMLElementTagNameMap[T] },
    ): Tags.Builder<HTMLElementTagNameMap[T]>
} = (tag: CustomTag.TagName, extendsTag = "div", extendsElement = HTMLElement) => (
    customElements.define(tag, class extends extendsElement {}, { extends: extendsTag }),
    Tags[tag]!
)
