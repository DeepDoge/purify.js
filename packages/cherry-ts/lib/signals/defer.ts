import { FOLLOW, UNFOLLOW } from "../helpers"
import type { Signal, SignalLike } from "./signal"
import { signal, signalFrom } from "./signal"

export let defer = <T>(signalOrFunction: SignalLike<T>, timeout_ms = 250): Signal<T> => {
    let sourceSignal = signalFrom(signalOrFunction)
    let timeout = null as Timer | null
    let follow: Signal.Follow | null = null
    return signal(
        sourceSignal.ref,
        (set) => (
            (follow = sourceSignal[FOLLOW]((value) => {
                timeout && clearTimeout(timeout)
                timeout = setTimeout(() => ((timeout = null), set(value)), timeout_ms)
            })),
            follow?.[UNFOLLOW]
        ),
    )
}
