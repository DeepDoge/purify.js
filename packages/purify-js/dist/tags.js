import { Signal as e } from "./signals.js"
let instancesOf = (e, ...t) => t.some((t) => e instanceof t)
export let fragment = (...e) => {
    let t = document.createDocumentFragment()
    return e && t.append(...e.map(toAppendable)), t
}
export let toAppendable = (t) => {
    if (null == t) return ""
    if (instancesOf(t, Element, DocumentFragment, CharacterData)) return t
    if (instancesOf(t, e)) {
        let n = enchance("div")
        return (
            (n.style.display = "contents"),
            n.onConnect(() => t.follow((e) => n.replaceChildren(toAppendable(e)), !0)),
            n
        )
    }
    return instancesOf(t, Builder) ? t.element : Array.isArray(t) ? fragment(...t.map(toAppendable)) : String(t)
}
let enchance = (e, t = `x-${e}`, n = customElements, l = n.get(t)) => (
    l ||
        n.define(
            t,
            (l = class extends document.createElement(e).constructor {
                #a = new Set()
                #b = []
                #c(t, n = t()) {
                    n && this.#b.push(n)
                }
                connectedCallback() {
                    for (let e of this.#a) this.#c(e)
                }
                disconnectedCallback() {
                    for (let e of this.#b) e()
                    this.#b.length = 0
                }
                onConnect(e) {
                    let t = this
                    return (
                        t.#a.add(e),
                        t.isConnected && t.#c(e),
                        () => {
                            t.#a.delete(e)
                        }
                    )
                }
            }),
            { extends: e },
        ),
    new l()
)
export let tags = new Proxy(
    {},
    {
        get:
            (e, t) =>
            (e = {}) =>
                Builder.Proxy(enchance(t)).attributes(e),
    },
)
export class Builder {
    element
    constructor(e) {
        this.element = e
    }
    children(...e) {
        return this.element.append(...e.map(toAppendable)), this
    }
    attributes(t) {
        let n = this.element
        for (let l in t) {
            let c = t[l],
                s = (e) => {
                    null == e ? n.removeAttribute(l) : n.setAttribute(l, String(e))
                }
            instancesOf(c, e) ? n.onConnect(() => c.follow(s, !0)) : s(c)
        }
        return this
    }
    static Proxy = (t) =>
        new Proxy(new Builder(t), {
            get: (n, l, c) =>
                n[l] ??
                (l in t &&
                    ((n) => (
                        instancesOf(n, e)
                            ? t.onConnect(() =>
                                  n.follow((e) => {
                                      t[l] = e
                                  }, !0),
                              )
                            : (t[l] = n),
                        c
                    ))),
        })
}
