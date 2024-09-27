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
export class Signal {
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
    derive(getter) {
        return computed([this], () => getter(this.val))
    }
}
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
Signal.State = class extends Signal {
    #followers = new Set()
    #value
    constructor(initial) {
        super()
        this.#value = initial
    }
    get val() {
        return this.#value
    }
    set val(newValue) {
        let self = this
        if (self.#value === newValue) return
        self.#value = newValue
        self.emit()
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
    follow(follower, immediate) {
        let self = this
        if (immediate) {
            follower(self.#value)
        }
        self.#followers.add(follower)
        return () => {
            self.#followers.delete(follower)
        }
    }
    emit() {
        let i = this.#followers.size
        for (let follower of this.#followers) {
            if (i-- > 0) follower(this.#value)
        }
    }
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
Signal.Computed = class extends Signal {
    #dependencies
    #getter
    constructor(dependencies, getter) {
        super()
        this.#dependencies = dependencies
        this.#getter = getter
    }
    #cache = {}
    #previousCache = this.#cache
    #followerCount = 0
    #counter = 0
    get val() {
        let self = this
        return self.#followerCount ? self.#cache : self.#getter()
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
    follow(follower, immediate) {
        let self = this
        if (immediate) {
            follower(self.val)
        }
        self.#followerCount++
        let unfollows = []
        for (let dependency of self.#dependencies) {
            unfollows.push(
                dependency.follow(() => {
                    if (!self.#counter) {
                        self.#counter = self.#followerCount
                        self.#cache = self.#getter()
                    }
                    self.#counter--
                    if (self.#previousCache !== (self.#previousCache = self.#cache)) {
                        follower(self.#cache)
                    }
                }),
            )
        }
        return () => {
            for (let unfollow of unfollows) {
                unfollow()
            }
            this.#followerCount--
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
export let ref = (value) => new Signal.State(value)
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
export let computed = (dependencies, getter) => new Signal.Computed(dependencies, getter)
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
export let awaited = (promise, until = null) => {
    let signal = ref(until)
    promise.then((value) => (signal.val = value))
    return signal
}
