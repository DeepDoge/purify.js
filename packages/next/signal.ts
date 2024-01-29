import { FOLLOW, IMMEDIATE, MODE, isFunction } from "./helpers"

export type SignalLike<T> = Signal<T> | (() => T)
export type SignalLikeOrValue<T> = SignalLike<T> | T
export interface Signal<T> {
    readonly ref: T
    follow(
        follower: Signal.Follower<T>,
        options?: Signal.Follower.Options,
    ): Signal.Unfollow
}
export namespace Signal {
    export type Follower<T> = (ref: T) => void
    export namespace Follower {
        export type Options = {
            mode: "once" | "normal" | "immediate"
        }
    }
    export type Unfollow = () => void

    export type Mut<T> = {
        ref: T
        [FOLLOW](follower: Follower<T>, options?: Follower.Options): Unfollow
        asImmutable(): Signal<T>
    }
}

let signals = new WeakSet<Signal<unknown>>()

export let isSignal = (value: unknown): value is Signal<unknown> =>
    signals.has(value as Signal<unknown>)
export let isSignalLike = (value: unknown): value is SignalLike<unknown> =>
    isSignal(value) || isFunction(value)

export let Signal = <T>(ref: T): Signal.Mut<T> => {
    let followers = new Set<Signal.Follower<T>>()
    let self: Signal.Mut<T> = {
        get ref() {
            return ref
        },
        set ref(value) {
            value !== ref &&
                ((ref = value), followers.forEach((follower) => follower(value)))
        },
        [FOLLOW]: (follower, options, unfollow = () => followers.delete(follower)) => (
            followers.add(
                options?.[MODE] == IMMEDIATE
                    ? (follower(ref), follower)
                    : options?.[MODE] == "once"
                      ? () => (follower(ref), unfollow)
                      : follower,
            ),
            unfollow
        ),
        asImmutable: () => self,
    }
    signals.add(self)
    return self
}
