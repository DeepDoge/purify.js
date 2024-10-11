import { Signal } from "./signals"

let dependencyTrackingStack: Set<Signal<unknown>>[] = []

export let add = (signal: Signal<unknown>): void => {
    dependencyTrackingStack.at(-1)?.add(signal)
}

export let track = <R>(set: Set<Signal<unknown>>, callAndTrack: () => R): R => {
    dependencyTrackingStack.push(set)
    let result = callAndTrack()
    dependencyTrackingStack.pop()
    return result
}
