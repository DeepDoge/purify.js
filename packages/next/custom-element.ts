import { ON_CONNECT, doc } from "./helpers"

export namespace CustomElement {
    export type Tag = `${string}${string}-${string}${string}`
    export type ConnectListener = () => void | DisconnectListener
    export type DisconnectListener = () => void
}

export type CustomElement<T extends HTMLElement = HTMLElement> = T & {
    onConnect$(listener: CustomElement.ConnectListener): void
    onCleanup$(listener: CustomElement.DisconnectListener): void
}

let cache = new Map<string, new () => HTMLElement>()
let constructorOf: {
    <T extends keyof HTMLElementTagNameMap>(tag: T): new () => HTMLElementTagNameMap[T]
    (tag: string): new () => HTMLElement
} = (tag: string, constructor = cache.get(tag)): new () => HTMLElement =>
    constructor
        ? constructor
        : ((constructor = doc.createElement(tag).constructor as new () => HTMLElement),
          cache.set(tag, constructor),
          constructor)

let custom = customElements

export let CustomElement: {
    (tag: CustomElement.Tag, extendsTag?: string): new () => CustomElement
    <T extends keyof HTMLElementTagNameMap>(
        tag: CustomElement.Tag,
        extendsTag?: T,
    ): new () => CustomElement<HTMLElementTagNameMap[T]>
} = (tag: CustomElement.Tag, extendsTag?: string): new () => CustomElement => {
    let constructor = extendsTag ? constructorOf(extendsTag) : HTMLElement

    let connectedListeners = new Set<CustomElement.ConnectListener>()
    let disconnectedListeners = new Set<CustomElement.DisconnectListener>()
    let callConnectedListener = (listener: CustomElement.ConnectListener) => {
        let result = listener()
        result && disconnectedListeners.add(result)
    }

    custom.define(
        tag,
        class extends constructor implements CustomElement {
            [ON_CONNECT](listener: CustomElement.ConnectListener): void {
                connectedListeners.add(listener)
                this.isConnected && callConnectedListener(listener)
            }

            onCleanup$(listener: CustomElement.DisconnectListener): void {
                disconnectedListeners.add(listener)
                this.isConnected && listener()
            }

            connectedCallback() {
                connectedListeners.forEach(callConnectedListener)
            }

            disconnectedCallback() {
                disconnectedListeners.forEach((listener) => listener())
            }
        },
        extendsTag ? { extends: extendsTag } : {},
    )

    return custom.get(tag) as new () => CustomElement
}
