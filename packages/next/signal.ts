import { FOLLOW, FOR_EACH, IMMEDIATE, MODE, isFunction } from "./helpers"

export type SignalLike<T> = Signal<T> | (() => T)
export type SignalLikeOrValue<T> = SignalLike<T> | T
export interface Signal<T> {
    readonly ref: T
    follow(
        follower: Signal.Follower<T>,
        options?: Signal.Follower.Options,
    ): Signal.Unfollow
    ping(): void
}
export namespace Signal {
    export type Follower<T> = (ref: T) => void
    export namespace Follower {
        export type Options = {
            mode?: "once" | "normal" | "immediate"
        }
    }
    export type Unfollow = () => void

    export type Builder = <T>(initial: T, updater?: Updater<T>) => Signal.Mut<T>
    export type Updater<T> = (set: (value: T) => void) => (() => void) | void

    export type Mut<T> = {
        ref: T
        follow(follower: Follower<T>, options?: Follower.Options): Unfollow
        ping(): void
        asImmutable(): Signal<T>
    }
}

let signals = new WeakSet<Signal<unknown>>()

export let isSignal = (value: unknown): value is Signal<unknown> =>
    signals.has(value as Signal<unknown>)
export let isSignalLike = (value: unknown): value is SignalLike<unknown> =>
    isSignal(value) || isFunction(value)

export let signal: Signal.Builder = (currentValue, updater) => {
    type T = typeof currentValue

    let followers = new Set<Signal.Follower<T>>()

    let ping: Signal<T>["ping"] = () =>
        followers[FOR_EACH]((follower) => follower(currentValue))
    let set = (value: T) => value !== currentValue && ((currentValue = value), ping())

    let cleanup: (() => void) | void
    let passive = () => cleanup && (cleanup(), (cleanup = void 0))
    let active = () => updater && !cleanup && (cleanup = updater(set))

    let self: Signal.Mut<T> = {
        set ref(value) {
            set(value)
        },
        get ref() {
            active(), setTimeout(() => followers.size || passive(), 5000)
            usedSignalsTail?.add(self)
            return currentValue
        },
        ping,
        [FOLLOW]: (
            follower,
            options = {},
            unfollow = () => (followers.delete(follower), followers.size || passive()),
        ) => (
            active(),
            followers.add(
                options[MODE] == IMMEDIATE
                    ? (follower(currentValue), follower)
                    : options[MODE] == "once"
                      ? () => (unfollow(), follower(currentValue))
                      : follower,
            ),
            unfollow
        ),
        asImmutable: () => self,
    }
    signals.add(self)
    return self
}

let usedSignalsTail: Set<Signal<unknown>> | undefined

let deriveCache = new WeakMap<Function, Signal.Mut<unknown>>()
export let derive = <T>(
    fn: () => T,
    staticDependencies?: readonly Signal<unknown>[],
): Signal<T> => {
    let value = deriveCache.get(fn) as Signal.Mut<T> | undefined
    return staticDependencies
        ? signal<T>(fn(), (set) => {
              let unfollows = staticDependencies.map((dependency) =>
                  dependency[FOLLOW](() => set(fn())),
              )
              return () => unfollows.forEach((unfollow) => unfollow())
          })
        : value ||
              (deriveCache.set(
                  fn,
                  (value = signal<T>(undefined!, (set) => {
                      let toUnfollow: Set<Signal<unknown>> | undefined
                      let unfollows = new WeakMap<Signal<unknown>, Signal.Unfollow>()
                      let unfollow = () =>
                          toUnfollow?.[FOR_EACH]((signal) => unfollows.get(signal)!())
                      let update = () => {
                          let toFollow = new Set<Signal<unknown>>()
                          let userSignalsBefore = usedSignalsTail
                          let result: T
                          usedSignalsTail = toFollow
                          try {
                              result = fn()
                          } catch (error) {
                              throw error
                          } finally {
                              usedSignalsTail = userSignalsBefore
                          }
                          set(result)
                          toFollow[FOR_EACH]((signal) => {
                              !unfollows.has(signal) &&
                                  unfollows.set(signal, signal[FOLLOW](update))
                              toUnfollow?.delete(signal)
                          })
                          unfollow()
                          toUnfollow = toFollow
                      }

                      update()

                      return unfollow
                  })),
              ),
              value)
}
