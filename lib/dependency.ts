import { Signal } from "./signals"

let dependencyTrackingStack: (Set<Signal<unknown>> | undefined)[] = []

export let add = (signal: Signal<unknown>): void => {
    dependencyTrackingStack.at(-1)?.add(signal)
}

export let track = <R>(callAndTrack: () => R, set?: Set<Signal<unknown>>): R => {
    dependencyTrackingStack.push(set)
    let result = callAndTrack()
    dependencyTrackingStack.pop()
    return result
}
