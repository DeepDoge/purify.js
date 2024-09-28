/**
 * Represents an object with a value that can be followed for changes.
 *
 * @template T The type of the value.
 *
 * @example
 * const signal = ref(0);
 * signal.follow((value) => console.log(value), true); // logs: 0
 * signal.val = 1; // logs: 1
 */
export interface SignalLike<T> {
    readonly val: T
    follow(follower: Signal.Follower<T>, immediate?: boolean): Signal.Unfollower
}

/**
 * Abstract class for signals that can be followed and derived from.
 *
 * @template T The type of the value.
 *
 * @example
 * const signal = ref(10);
 * const derived = signal.derive(val => val * 2);
 * console.log(derived.val); // logs: 20
 */
export abstract class Signal<T> implements SignalLike<T> {
    public abstract get val(): T
    public abstract follow(follower: Signal.Follower<T>, immediate?: boolean): Signal.Unfollower

    /**
     * Derives a new signal based on the current signal.
     *
     * @template U The type of the derived value.
     * @param getter A function that computes the derived value from the original value.
     * @returns A new derived signal.
     *
     * @example
     * const signal = ref(10);
     * const derivedSignal = signal.derive(value => value + 5);
     * console.log(derivedSignal.val); // logs: 15
     */
    public derive<U>(getter: (value: T) => U) {
        return computed((add) => getter(add(this).val))
    }
}

export namespace Signal {
    /**
     * A function that is called when the signal's value changes.
     *
     * @template T The type of the signal value.
     */
    export type Follower<T> = { (value: T): unknown }

    /**
     * A function to stop following a signal.
     */
    export type Unfollower = { (): void }

    const FOLLOWERS = Symbol()

    /**
     * A signal whose value can be updated.
     *
     * @template T The type of the value.
     *
     * @example
     * const state = new Signal.State(0);
     * state.follow(val => console.log(val)); // logs: 0
     * state.val = 42; // logs: 42
     */
    export class State<T> extends Signal<T> {
        public [FOLLOWERS] = new Set<Signal.Follower<T>>()
        #value: T

        constructor(initial: T) {
            super()
            this.#value = initial
        }

        public override get val() {
            return this.#value
        }

        public override set val(newValue) {
            if (this.#value === newValue) return
            this.#value = newValue
            this.emit()
        }

        /**
         * Allows a function to follow changes to the signal's value.
         *
         * @param follower A function to be called when the value changes.
         * @param immediate Whether to call the follower immediately with the current value.
         * @returns A function to unfollow the signal.
         *
         * @example
         * const state = new Signal.State(10);
         * const unfollow = state.follow(val => console.log(val), true); // logs: 10
         * state.val = 20; // logs: 20
         * unfollow(); // stops following
         */
        public override follow(follower: Follower<T>, immediate?: boolean): Signal.Unfollower {
            if (immediate) {
                follower(this.#value)
            }

            this[FOLLOWERS].add(follower)

            return () => {
                this[FOLLOWERS].delete(follower)
            }
        }

        public emit() {
            let i = this[FOLLOWERS].size
            for (let follower of this[FOLLOWERS]) {
                if (i-- > 0) follower(this.#value)
            }
        }
    }

    export namespace Computed {
        export type Getter<T> = (add: AddDependency) => T
        export type AddDependency = <T extends SignalLike<unknown>>(newDependency: T) => T
    }

    /**
     * A signal that computes its value from other signals.
     *
     * @template T The type of the computed value.
     *
     * @example
     * const signal1 = ref(10);
     * const signal2 = ref(20);
     * const computedSignal = computed([signal1, signal2], () => signal1.val + signal2.val);
     * console.log(computedSignal.val); // logs: 30
     */
    export class Computed<T> extends Signal<T> {
        #dependencies = new Map<SignalLike<unknown>, Signal.Unfollower>()
        #getter: Computed.Getter<T>
        #state = ref<T>(0 as never)

        constructor(getter: Computed.Getter<T>) {
            super()
            this.#getter = getter
        }

        #update() {
            let self = this
            let newDependencies = new Set<SignalLike<unknown>>()
            let val = (self.#state.val = self.#getter((dependency) => {
                newDependencies.add(dependency)
                return dependency
            }))

            for (let [dependency, unfollow] of self.#dependencies) {
                if (!newDependencies.has(dependency)) {
                    unfollow()
                    self.#dependencies.delete(dependency)
                }
            }

            for (let dependency of newDependencies) {
                if (!self.#dependencies.has(dependency)) {
                    self.#dependencies.set(
                        dependency,
                        dependency.follow(() => self.#update()),
                    )
                }
            }

            return val
        }

        public override get val(): T {
            return this.#state[FOLLOWERS].size ? this.#state.val : this.#getter((x) => x)
        }

        /**
         * Follows changes to the computed signal.
         *
         * @param follower A function to be called when the value changes.
         * @param immediate Whether to call the follower immediately with the current value.
         * @returns A function to unfollow the signal.
         *
         * @example
         * const signal = ref(5);
         * const computedSignal = computed([signal], () => signal.val * 2);
         * computedSignal.follow(val => console.log(val), true); // logs: 10
         * signal.val = 6; // logs: 12
         */
        public override follow(follower: Follower<T>, immediate?: boolean): Signal.Unfollower {
            let self = this
            if (!self.#state[FOLLOWERS].size) {
                // start
                this.#update()
            }

            let unfollow = self.#state.follow(follower, immediate)

            return () => {
                unfollow()
                if (!self.#state[FOLLOWERS].size) {
                    // stop
                    self.#dependencies.forEach((unfollow) => unfollow())
                    self.#dependencies.clear()
                }
            }
        }
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
export let ref = <T>(value: T): Signal.State<T> => new Signal.State(value)

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
export let computed = <T>(getter: Signal.Computed.Getter<T>): Signal.Computed<T> => new Signal.Computed(getter)

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
export let awaited = <T, const U = null>(promise: Promise<T>, until: U = null as never): Signal<T | U> => {
    let signal = ref<T | U>(until)
    promise.then((value) => (signal.val = value))
    return signal
}
