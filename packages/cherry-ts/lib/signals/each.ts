import { FOLLOW, FOLLOW_IMMEDIATE_OPTIONS, UNDEFINED, UNFOLLOW } from "../helpers"
import type { Signal, SignalLike } from "./signal"
import { signal, signalFrom } from "./signal"

export let each = <T>(arr: SignalLike<T[]>) => ({
    key: (getKey: (value: T, index: number) => unknown) => ({
        as: <R>(as: (value: Signal<T>, index: Signal<number>) => R): Signal<R[]> => {
            let arrSignal = signalFrom(arr)
            let cache = new Map<unknown, [R, Signal.Mut<T>, Signal.Mut<number>]>()
            return signal<R[]>(
                UNDEFINED!,
                (set) =>
                    arrSignal[FOLLOW]((arr) => {
                        let toRemove = new Set(cache.keys())
                        set(
                            arr.map((value, index) => {
                                let key = getKey(value, index)
                                if (cache.has(key)) {
                                    toRemove.delete(key)
                                    let [result, valueSignal, indexSignal] =
                                        cache.get(key)!
                                    valueSignal.ref = value
                                    valueSignal.ping()
                                    indexSignal.ref = index
                                    indexSignal.ping()
                                    return result
                                }
                                let valueSignal = signal(value)
                                let indexSignal = signal(index)
                                let result = as(valueSignal, indexSignal)
                                cache.set(key, [result, valueSignal, indexSignal])
                                return result
                            }),
                        )
                        for (let key of toRemove) cache.delete(key)
                    }, FOLLOW_IMMEDIATE_OPTIONS)[UNFOLLOW],
            )
        },
    }),
})
