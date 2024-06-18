export class Signal<const T = unknown> {
    constructor(initial: T)
    get val(): T
    follow(
        follower: Signal.Follower<T>,
        immediate?: boolean,
        self?: this,
    ): Signal.Unfollower
    notify(self?: this, value?: T): void
}
export namespace Signal {
    class State<T = unknown> extends Signal<T> {
        set val(value: T)
        get val(): T
    }
    class Compute<T = unknown> extends Signal<T> {
        constructor(callback: Compute.Callback<T>)
    }
    namespace Compute {
        type Callback<T> = { (): T }
    }
    type Setter<T> = { (value: T): void }
    type Getter<T> = { (): T }
    type Follower<T> = { (value: T): unknown }
    type Unfollower = { (): void }
}
export function ref<T>(value: T): Signal.State<T>
export function computed<T>(callback: Signal.Compute.Callback<T>): Signal.Compute<T>
export function awaited<T, const U = null>(
    promise: Promise<T>,
    until?: U,
    signal?: Signal.State<T | U>,
): Signal<T | U>
