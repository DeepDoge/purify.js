import { FOLLOW, FOLLOW_IMMEDIATE_OPTIONS, UNFOLLOW } from "../helpers"
import type { Signal, SignalLikeOrValue } from "./signal"
import { isSignalLike, signal, signalFrom } from "./signal"

export let awaited: {
    <T>(promise: SignalLikeOrValue<Promise<T>>): Signal<T | null>
    <T, U>(promise: SignalLikeOrValue<Promise<T>>, until: U): Signal<T | U>
} = (
    promise: SignalLikeOrValue<Promise<unknown>>,
    until: unknown = null,
): Signal<unknown> =>
    isSignalLike(promise)
        ? signal(
              until,
              (set) =>
                  signalFrom(promise)[FOLLOW](
                      (promise) => (set(until), promise.then((value) => set(value))),
                      FOLLOW_IMMEDIATE_OPTIONS,
                  )[UNFOLLOW],
          )
        : signal(until, (set) => {
              promise.then((value) => set(value))
          })
