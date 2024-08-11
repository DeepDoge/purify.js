let trackerStack: Set<Signal<any>>[] = []

/**
 * A Signal class that represents a reactive value.
 * @template T - The type of the signal's value.
 */
export class Signal<T = unknown> {
    #value: T
    #followers = new Set<Signal.Follower<T>>()
    #starter: Signal.Starter<T> | undefined
    #cleanup: Signal.Cleanup | undefined | null | void

    /**
     * Constructs a new Signal instance.
     * @param initial - The initial value of the signal.
     */
    constructor(initial: T, starter?: Signal.Starter<T>) {
        this.#value = initial
        this.#starter = starter
    }

    protected set(value: T, self = this) {
        let changed = self.#value !== value
        self.#value = value
        if (changed) self.notify()
    }

    /**
     * Gets the current value of the signal.
     * @returns The current value of the signal.
     */
    get val(): T {
        trackerStack.at(-1)?.add(this)
        return this.#value
    }

    /**
     * Follows the signal's value changes and calls the provided follower function.
     * @param follower - The function to be called when the signal's value changes.
     * @param immediate - If true, the follower function will be called immediately with the initial value.
     * @returns An object that can be used to unfollow the signal.
     */
    follow(follower: Signal.Follower<T>, immediate?: boolean): Signal.Unfollower
    follow(
        follower: Signal.Follower<T>,
        immediate?: boolean,
        self = this,
    ): Signal.Unfollower {
        if (immediate) follower(self.val)
        self.#followers.add(follower)

        if (self.#followers.size == 1) {
            self.#cleanup = self.#starter?.(self.set.bind(self))
        }

        return () => {
            self.#followers.delete(follower)
            if (!self.#followers.size) {
                self.#cleanup?.()
                self.#cleanup = null
            }
        }
    }

    /**
     * Notifies all followers of the signal to update their values.
     */
    notify(): void
    notify(self = this): void {
        for (let follower of self.#followers) {
            follower(self.val)
        }
    }
}

export namespace Signal {
    export type Cleanup = { (): unknown }
    export type Starter<T> = { (set: Setter<T>): void | Cleanup }

    /**
     * A type representing a function that sets a value.
     * @template T - The type of the value to be set.
     */
    export type Setter<T> = { (value: T): void }

    /**
     * A type representing a function that gets a value.
     * @template T - The type of the value to be retrieved.
     */
    export type Getter<T> = { (): T }

    /**
     * A type representing a function that follows a signal's value changes.
     * @template T - The type of the signal's value.
     */
    export type Follower<T> = { (value: T): unknown }

    /**
     * A type representing an object that can be used to unfollow a signal.
     */
    export type Unfollower = { (): void }

    /**
     * A Signal subclass that represents a mutable reactive value.
     * @template T - The type of the signal's value.
     */
    export class State<T> extends Signal<T> {
        /**
         * Gets the current value of the signal.
         * @returns The current value of the signal.
         */
        get val(): T {
            return super.val
        }

        /**
         * Sets the current value of the signal.
         * @param value - The new value of the signal.
         */
        set val(value: T) {
            super.set(value)
        }
    }

    /**
     * A Signal subclass that represents a computed value.
     * @template T - The type of the signal's value.
     */
    export class Compute<T> extends Signal<T> {
        #fresh = false
        constructor(callback: Signal.Compute.Callback<T>) {
            let dependencies = new Map<Signal<unknown>, Signal.Unfollower>(),
                updateAndTrack = (set: Setter<T>) => {
                    let trackedSet = new Set<Signal<any>>()
                    trackerStack.push(trackedSet)
                    let value = callback()
                    trackerStack.pop()
                    trackedSet.delete(this)
                    set(value)

                    // Unfollow and remove dependencies that are no longer being tracked
                    dependencies.forEach((unfollow, dependency) => {
                        if (trackedSet.has(dependency)) return
                        unfollow()
                        dependencies.delete(dependency)
                    })

                    // Follow new dependencies
                    trackedSet.forEach((dependency) => {
                        if (dependencies.has(dependency)) return
                        dependencies.set(
                            dependency,
                            dependency.follow(() => updateAndTrack(set)),
                        )
                    })
                }
            super(0 as never, (set) => {
                this.#fresh = true
                updateAndTrack(set)
                return () => {
                    this.#fresh = false
                    // Unfollow all dependencies on cleanup when we have no followers
                    dependencies.forEach((unfollow, dependency) => {
                        unfollow()
                        dependencies.delete(dependency)
                    })
                }
            })
        }

        get val() {
            if (!this.#fresh) {
                setTimeout(
                    this.follow(() => {}),
                    5000,
                )
            }
            return super.val
        }
    }

    export namespace Compute {
        /**
         * A type representing a function that computes a value.
         * @template T - The type of the computed value.
         */
        export type Callback<T> = { (): T }
    }
}

/**
 * Creates a new State signal with the provided initial value.
 * @template T - The type of the signal's value.
 * @param value - The initial value of the signal.
 * @returns A new State signal.
 * @example
 * const count = ref(0);
 */
export let ref = <T>(value: T): Signal.State<T> => new Signal.State<T>(value)

/**
 * Creates a new Compute signal that computes its value using the provided callback function.
 * @template T - The type of the signal's value.
 * @param callback - The function to compute the signal's value.
 * @returns A new Compute signal.
 * @example
 * const doubleCount = computed(() => count.val * 2);
 */
export let computed = <T>(callback: Signal.Compute.Callback<T>): Signal.Compute<T> =>
    new Signal.Compute<T>(callback)

/**
 * Creates a new Signal that resolves its value when the provided promise resolves.
 * @template T - The type of the promise's resolved value.
 * @template U - The type of the until value.
 * @param promise - The promise to await.
 * @param until - The value to resolve the signal with when the promise is not yet resolved.
 * @returns A new Signal that resolves its value when the provided promise resolves.
 * @example
 * const data = awaited(fetchData());
 */
export let awaited = <T, const U = null>(
    promise: Promise<T>,
    until: U = null as never,
): Signal<T | U> => {
    let signal = ref<T | U>(until)
    promise.then((value) => (signal.val = value))
    return signal
}

/**
 * Creates an effect that reactively calls the provided callback function.
 * @template T - The type of the signal's value.
 * @param callback - The function to call when the signal's value changes.
 * @returns An object that can be used to stop the effect.
 * @example
 * effect(() => console.log(count.val));
 */
export let effect = <T>(callback: Signal.Compute.Callback<T>): Signal.Unfollower =>
    computed(callback).follow(() => 0)
