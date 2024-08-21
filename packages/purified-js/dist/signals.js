let trackerStack = [];
/**
 * A Signal class that represents a reactive value.
 * @template T - The type of the signal's value.
 */
export class Signal {
    #value;
    #followers = new Set();
    #starter;
    #cleanup;
    /**
     * Constructs a new Signal instance.
     * @param initial - The initial value of the signal.
     */
    constructor(initial, starter) {
        this.#value = initial;
        this.#starter = starter;
    }
    set(value, self = this) {
        let changed = self.#value !== value;
        self.#value = value;
        if (changed)
            self.notify();
    }
    /**
     * Gets the current value of the signal.
     * @returns The current value of the signal.
     */
    get val() {
        trackerStack.at(-1)?.add(this);
        return this.#value;
    }
    follow(follower, immediate, self = this) {
        if (immediate)
            follower(self.val);
        self.#followers.add(follower);
        if (self.#followers.size == 1) {
            self.#cleanup = self.#starter?.(self.set.bind(self));
        }
        return () => {
            self.#followers.delete(follower);
            if (!self.#followers.size) {
                self.#cleanup?.();
                self.#cleanup = null;
            }
        };
    }
    notify(self = this) {
        for (let follower of self.#followers) {
            follower(self.val);
        }
    }
}
(function (Signal) {
    /**
     * A Signal subclass that represents a mutable reactive value.
     * @template T - The type of the signal's value.
     */
    class State extends Signal {
        /**
         * Gets the current value of the signal.
         * @returns The current value of the signal.
         */
        get val() {
            return super.val;
        }
        /**
         * Sets the current value of the signal.
         * @param value - The new value of the signal.
         */
        set val(value) {
            super.set(value);
        }
    }
    Signal.State = State;
    /**
     * A Signal subclass that represents a computed value.
     * @template T - The type of the signal's value.
     */
    class Compute extends Signal {
        #fresh = false;
        constructor(callback) {
            let dependencies = new Map(), updateAndTrack = (set) => {
                let trackedSet = new Set();
                trackerStack.push(trackedSet);
                let value = callback();
                trackerStack.pop();
                trackedSet.delete(this);
                set(value);
                // Unfollow and remove dependencies that are no longer being tracked
                dependencies.forEach((unfollow, dependency) => {
                    if (trackedSet.has(dependency))
                        return;
                    unfollow();
                    dependencies.delete(dependency);
                });
                // Follow new dependencies
                trackedSet.forEach((dependency) => {
                    if (dependencies.has(dependency))
                        return;
                    dependencies.set(dependency, dependency.follow(() => updateAndTrack(set)));
                });
            };
            super(0, (set) => {
                this.#fresh = true;
                updateAndTrack(set);
                return () => {
                    this.#fresh = false;
                    // Unfollow all dependencies on cleanup when we have no followers
                    dependencies.forEach((unfollow, dependency) => {
                        unfollow();
                        dependencies.delete(dependency);
                    });
                };
            });
        }
        get val() {
            if (!this.#fresh) {
                setTimeout(this.follow(() => { }), 5000);
            }
            return super.val;
        }
    }
    Signal.Compute = Compute;
})(Signal || (Signal = {}));
/**
 * Creates a new State signal with the provided initial value.
 * @template T - The type of the signal's value.
 * @param value - The initial value of the signal.
 * @returns A new State signal.
 * @example
 * const count = ref(0);
 */
export let ref = (...params) => new Signal.State(...params);
/**
 * Creates a new Compute signal that computes its value using the provided callback function.
 * @template T - The type of the signal's value.
 * @param callback - The function to compute the signal's value.
 * @returns A new Compute signal.
 * @example
 * const doubleCount = computed(() => count.val * 2);
 */
export let computed = (callback) => new Signal.Compute(callback);
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
export let awaited = (promise, until = null) => {
    let signal = ref(until);
    promise.then((value) => (signal.val = value));
    return signal;
};
/**
 * Creates an effect that reactively calls the provided callback function.
 * @template T - The type of the signal's value.
 * @param callback - The function to call when the signal's value changes.
 * @returns An object that can be used to stop the effect.
 * @example
 * effect(() => console.log(count.val));
 */
export let effect = (callback) => computed(callback).follow(() => 0);
