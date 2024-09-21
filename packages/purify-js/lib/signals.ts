let trackerStack: Set<Signal<any>>[] = []

export namespace Signal {
    export type Cleanup = { (): unknown }

    /**
     * A type representing a function that follows a signal's value changes.
     * @template T - The type of the signal's value.
     */
    export type Follower<T> = { (value: T): unknown }

    /**
     * A type representing an object that can be used to unfollow a signal.
     */
    export type Unfollower = { (): void }
}

export abstract class Signal<T> {
    abstract get val(): T

    protected start(): Signal.Cleanup | void {}
    #stop?: (() => void) | void

    protected track() {
        trackerStack.at(-1)?.add(this)
    }

    #followers = new Set<Signal.Follower<T>>()
    follow(follower: Signal.Follower<T>, immediate?: boolean): Signal.Unfollower {
        let self = this
        let followers = self.#followers

        if (immediate) {
            follower(self.val)
        }

        followers.add(follower)
        if (followers.size === 1) {
            this.#stop = self.start()
        }

        return () => {
            if (followers.delete(follower) && !followers.size) {
                self.#stop?.()
            }
        }
    }

    emit(value = this.val) {
        for (let follower of this.#followers) {
            follower(value)
        }
    }
}

export namespace Signal {
    export class State<T> extends Signal<T> {
        constructor(initial: T)
        constructor(private value: T) {
            super()
        }

        get val() {
            this.track()
            return this.value
        }

        set val(value: T) {
            let self = this

            // Updates value and checks if it has changed
            if (self.value !== (self.value = value)) {
                self.emit()
            }
        }
    }

    const Outdated = Symbol()
    type Outdated = typeof Outdated
    export namespace Compute {
        /**
         * A type representing a function that gets a value.
         * @template T - The type of the value to be retrieved.
         */
        export type Getter<T> = { (): T }
    }
    export class Compute<T> extends Signal<T> {
        constructor(private getter: Compute.Getter<T>) {
            super()
        }

        #dependencies = new Map<Signal<unknown>, Signal.Unfollower>()
        #cache: T | Outdated = Outdated
        #updateAndTrack() {
            let self = this
            let dependencies = self.#dependencies
            let trackedSet = new Set<Signal<any>>()
            trackerStack.push(trackedSet)
            let value = self.getter()
            trackerStack.pop()
            trackedSet.delete(self)

            // Updates value and checks if it has changed
            if (self.#cache !== (self.#cache = value)) {
                self.emit()
            }

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
                    dependency.follow(() => self.#updateAndTrack()),
                )
            })
        }

        protected override start(self = this) {
            self.#updateAndTrack()

            return () => {
                self.#cache = Outdated
                let dependencies = self.#dependencies
                dependencies.forEach((unfollow) => unfollow())
                dependencies.clear()
            }
        }

        get val() {
            let self = this
            self.track()
            return self.#cache === Outdated ? self.getter() : self.#cache
        }
    }
}

/**
 * Creates a new State signal with the provided initial value.
 * @template T - The type of the signal's value.
 * @param initial - The initial value of the signal.
 * @returns A new State signal.
 * @example
 * const count = ref(0);
 */
export let ref = <T>(initial: T): Signal.State<T> => new Signal.State<T>(initial)

/**
 * Creates a new Compute signal that computes its value using the provided callback function.
 * @template T - The type of the signal's value.
 * @param callback - The function to compute the signal's value.
 * @returns A new Compute signal.
 * @example
 * const doubleCount = computed(() => count.val * 2);
 */
export let computed = <T>(callback: Signal.Compute.Getter<T>): Signal.Compute<T> =>
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
export let effect = <T>(callback: Signal.Compute.Getter<T>): Signal.Unfollower =>
    computed(callback).follow(() => 0)
