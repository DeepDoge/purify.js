import { FOR_EACH, ON_CONNECT, doc } from "./helpers"

export namespace CustomElement {
    export type Tag = `${any}${any}-${any}${any}`
    export type ConnectListener = () => void | DisconnectListener
    export type DisconnectListener = () => void
}

export type CustomElement<T extends HTMLElement = HTMLElement> = T & {
    onConnect$(listener: CustomElement.ConnectListener): void
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

    custom.define(
        tag,
        class extends constructor implements CustomElement {
            #connectedListeners = new Set<CustomElement.ConnectListener>()
            #disconnectedListeners = new Set<CustomElement.DisconnectListener>()

            #callConnectedListener(listener: CustomElement.ConnectListener) {
                let result = listener()
                result && this.#disconnectedListeners.add(result)
            }

            [ON_CONNECT](listener: CustomElement.ConnectListener): void {
                let self = this
                self.#connectedListeners.add(listener)
                self.isConnected && self.#callConnectedListener(listener)
            }

            connectedCallback() {
                let self = this
                self.#connectedListeners[FOR_EACH]((listener) =>
                    self.#callConnectedListener(listener),
                )
            }

            disconnectedCallback() {
                this.#disconnectedListeners[FOR_EACH]((listener) => listener())
            }
        },
        extendsTag ? { extends: extendsTag } : {},
    )

    return custom.get(tag) as new () => CustomElement
}
