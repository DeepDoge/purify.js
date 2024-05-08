import { isSignal } from "./signals/core"

/**
 * @type {import('./tags').Builder<DocumentFragment>}
 */
export const fragment = (members) => {
    let fragment = document.createDocumentFragment()
    members && fragment.append(...members.map(toAppendable))
    return fragment
}

/**
 * @param {unknown} value
 * @returns {string | CharacterData | Element | DocumentFragment}
 */
export function toAppendable(value) {
    if (value === null) {
        return fragment()
    }

    if (
        value instanceof Element ||
        value instanceof DocumentFragment ||
        value instanceof CharacterData
    ) {
        return value
    }

    if (Array.isArray(value)) {
        return fragment(value.map(toAppendable))
    }

    if (isSignal(value)) {
        return new CherrySignalElement(value)
    }

    return String(value)
}

export class CherrySignalElement extends HTMLElement {
    /** @type {import('./signals/core').Signal.Mut<unknown>} */
    $signal

    /** @type {import('./signals/core').Signal.Unfollow<unknown> | undefined} */
    $unfollow
    /**
     * @param {typeof this.$signal} signal
     */
    constructor(signal) {
        super()
        this.style.display = "contents"
        this.$signal = signal
    }

    connectedCallback() {
        this.$unfollow = this.$signal.follow((val) => {
            this.replaceChildren(toAppendable(val))
        })
    }

    disconnectedCallback() {
        this.$unfollow?.()
    }
}
customElements.define("cherry-signal", CherrySignalElement)
