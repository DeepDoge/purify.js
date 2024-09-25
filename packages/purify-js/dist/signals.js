export class Signal {
    derive(e) {
        return computed([this], () => e(this.val))
    }
}
;(Signal.State = class extends Signal {
    #a = new Set()
    #b
    constructor(e) {
        super(), (this.#b = e)
    }
    get val() {
        return this.#b
    }
    set val(e) {
        let t = this
        if (t.#b === e) return
        t.#b = e
        let l = t.#a.size
        for (let o of t.#a) l-- > 0 && o(e)
    }
    follow(e, t) {
        let l = this
        return (
            t && e(l.#b),
            l.#a.add(e),
            () => {
                l.#a.delete(e)
            }
        )
    }
}),
    (Signal.Computed = class extends Signal {
        #c
        #d
        constructor(e, t) {
            super(), (this.#c = e), (this.#d = t)
        }
        #e = {}
        #f = this.#e
        #g = 0
        #h = 0
        get val() {
            return this.#g ? this.#e : this.#d()
        }
        follow(e, t) {
            let l = this
            t && e(l.val), l.#g++
            let o = []
            for (let r of l.#c)
                o.push(
                    r.follow(() => {
                        l.#h || ((l.#h = l.#g), (l.#e = l.#d())), l.#h--, l.#f !== (l.#f = l.#e) && e(l.#e)
                    }),
                )
            return () => {
                for (let e of o) e()
                this.#g--
            }
        }
    })
export let ref = (e) => new Signal.State(e)
export let computed = (e, t) => new Signal.Computed(e, t)
export let awaited = (e, t = null) => {
    let l = ref(t)
    return e.then((e) => (l.val = e)), l
}
