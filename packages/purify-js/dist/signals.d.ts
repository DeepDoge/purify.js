export class Signal<T = unknown> {
    constructor(initial: T)
    get val(): T

    follow(follower: Signal.Follower<T>, immediate?: boolean): Signal.Unfollower
    notify(): void
}
export namespace Signal {
    type Setter<T> = { (value: T): void }
    type Getter<T> = { (): T }
    type Follower<T> = { (value: T): unknown }
    type Unfollower = { (): void }

    class State<T> extends Signal<T> {
        get val(): T
        set val(value: T)
    }
    class Compute<T> extends Signal<T> {}
    namespace Compute {
        type Callback<T> = { (): T }
    }
}
export function ref<T>(value: T): Signal.State<T>
export function computed<T>(callback: Signal.Compute.Callback<T>): Signal.Compute<T>
export function awaited<T, const U = null>(promise: Promise<T>, until?: U): Signal<T | U>
export function effect<T>(callback: Signal.Compute.Callback<T>): Signal.Unfollower
