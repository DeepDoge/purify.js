import * as Dependency from "./dependency"
export { Dependency }

export abstract class Signal<T> {
    public abstract readonly val: T
    public abstract follow(
        follower: Signal.Follower<T>,
        immediate?: boolean
    ): Signal.Unfollower

    public derive<R>(getter: (value: T) => R): Signal.Computed<R> {
        return computed(() => {
            Dependency.add(this)
            return Dependency.track(() => getter(this.val))
        })
    }
}

export declare namespace Signal {
    type Follower<T> = (value: T) => void
    type Unfollower = () => void

    class State<T> extends Signal<T> {
        constructor(initial: T, startStop?: Signal.State.Start<T>)
        public get val(): T
        public set val(newValue: T)
        public follow(follower: Follower<T>, immediate?: boolean): Signal.Unfollower
        public emit(): void
    }

    namespace State {
        type Setter<T> = (value: T) => void
        type Start<T> = (set: Setter<T>) => Stop | void
        type Stop = () => void
    }

    class Computed<T> extends Signal<T> {
        constructor(getter: Signal.Computed.Getter<T>)
        public get val(): T
        public follow(follower: Follower<T>, immediate?: boolean): Signal.Unfollower
    }

    namespace Computed {
        type Getter<T> = () => T
    }
}

Signal.State = class<T> extends Signal<T> {
    #followers = new Set<Signal.Follower<T>>()
    #value: T

    constructor(initial: T, startStop?: Signal.State.Start<T>) {
        super()
        this.#value = initial
        this.#start = startStop
    }

    public get val() {
        Dependency.add(this)
        return this.#value
    }
    public set val(newValue: T) {
        if (this.#value === newValue) return
        this.#value = newValue
        this.emit()
    }

    #start: Signal.State.Start<T> | undefined
    #stop: Signal.State.Stop | undefined | void | null

    public follow(follower: Signal.Follower<T>, immediate?: boolean): Signal.Unfollower {
        if (!this.#followers.size) {
            this.#stop = this.#start?.((value) => (this.val = value))
        }

        if (immediate) {
            follower(this.#value)
        }

        this.#followers.add(follower)

        return () => {
            this.#followers.delete(follower)
            if (!this.#followers.size) {
                this.#stop?.()
                this.#stop = null
            }
        }
    }

    public emit() {
        let i = this.#followers.size
        for (let follower of this.#followers) {
            if (i-- > 0) follower(this.#value)
        }
    }
}

Signal.Computed = class<T> extends Signal<T> {
    #getter: Signal.Computed.Getter<T> | undefined | null
    #state: Signal.State<T>

    constructor(getter: Signal.Computed.Getter<T>) {
        super()
        this.#getter = getter

        let dependencies = new Map<Signal<unknown>, Signal.Unfollower>()

        this.#state = ref<T>(0 as never, (set) => {
            let update = () => {
                let newDependencies = new Set<Signal<unknown>>()
                let newValue = Dependency.track(getter, newDependencies)
                newDependencies.delete(this)
                set(newValue)

                for (let [dependency, unfollow] of dependencies) {
                    if (!newDependencies.has(dependency)) {
                        unfollow()
                        dependencies.delete(dependency)
                    }
                }

                for (let dependency of newDependencies) {
                    if (!dependencies.has(dependency)) {
                        dependencies.set(dependency, dependency.follow(update))
                    }
                }
            }
            update()
            this.#getter = null

            return () => {
                this.#getter = getter
                dependencies.forEach((unfollow) => unfollow())
                dependencies.clear()
            }
        })
    }

    public get val(): T {
        Dependency.add(this)
        return this.#getter ? this.#getter() : this.#state.val
    }

    public follow(follower: Signal.Follower<T>, immediate?: boolean): Signal.Unfollower {
        return this.#state.follow(follower, immediate)
    }
}

/**
 * Creates a new state signal with an initial value.
 *
 * @template T The type of the value.
 * @param value The initial value of the signal.
 * @returns A new signal with the given initial value.
 *
 * @example
 * const count = ref(0);
 * console.log(count.val); // logs: 0
 * count.val = 5;
 * console.log(count.val); // logs: 5
 */
export let ref = <T>(value: T, startStop?: Signal.State.Start<T>): Signal.State<T> =>
    new Signal.State(value, startStop)

/**
 * Creates a new computed signal from other signals.
 *
 * @template T The type of the computed value.
 * @param dependencies The signals that the computed signal depends on.
 * @param getter A function that computes the value based on the dependencies.
 * @returns A new computed signal.
 *
 * @example
 * const a = ref(1);
 * const b = ref(2);
 * const sum = computed([a, b], () => a.val + b.val);
 * console.log(sum.val); // logs: 3
 */
export let computed = <T>(getter: Signal.Computed.Getter<T>): Signal.Computed<T> =>
    new Signal.Computed(getter)

/**
 * Creates a new signal that will resolve with the result of a promise.
 *
 * @template T The type of the resolved value.
 * @template U The type of the initial value (usually `null`).
 * @param promise The promise that will resolve the value.
 * @param until The initial value before the promise resolves.
 * @returns A signal that updates when the promise resolves.
 *
 * @example
 * const dataSignal = awaited(fetchDataPromise, null);
 * dataSignal.follow(data => console.log(data)); // logs the resolved data when ready
 */
export let awaited = <T, const U = null>(
    promise: Promise<T>,
    until: U = null as never
): Signal<T | U> => {
    let signal = ref<T | U>(until)
    promise.then((value) => (signal.val = value))
    return signal
}
