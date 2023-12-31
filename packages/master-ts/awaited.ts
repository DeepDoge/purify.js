import type { Signal, SignalOrValueOrFn } from "./core"
import { isSignalOrFn, signal, signalFrom } from "./core"

export let awaited: {
    <T>(promise: SignalOrValueOrFn<Promise<T>>): Signal<T | null>
    <T, U>(promise: SignalOrValueOrFn<Promise<T>>, until: U): Signal<T | U>
} = (
    promise: SignalOrValueOrFn<Promise<unknown>>,
    until: unknown = null,
): Signal<unknown> =>
    isSignalOrFn(promise)
        ? signal(
              until,
              (set) =>
                  signalFrom(promise).follow(
                      (promise) => (set(until), promise.then((value) => set(value))),
                      {
                          mode: "immediate",
                      },
                  ).unfollow,
          )
        : signal(until, (set) => {
              promise.then((value) => set(value))
          })
