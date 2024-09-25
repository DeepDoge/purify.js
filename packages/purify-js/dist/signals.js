export class Signal {
    /**
     * Gets the current value of the signal. This triggers the follower to ensure the latest value is fetched.
     * @returns The current value of the signal.
     */
    get val() {
        let returns;
        this.follow((value) => (returns = value), true)();
        /// @ts-ignore // `follow` guarantees assignment of `returns`
        return returns;
    }
    /**
     * Creates a new computed Signal that derives its value based on the current signal's value using the provided getter function.
     *
     * @template U - The type of the derived signal's value.
     * @param getter - A function that receives the current value of the signal and returns the derived value.
     * @returns A new Computed signal that reflects changes in the source signal.
     *
     * @example
     * ```ts
     * const count = ref(0);
     * const doubledCount = count.derive(value => value * 2);
     * doubledCount.follow(value => console.log(value)); // Logs the doubled count value.
     * ```
     */
    derive(getter) {
        return computed(() => getter(this.val), [this]);
    }
}
(function (Signal) {
    class State extends Signal {
        value;
        followers = new Set();
        /**
         * Initializes a new State signal with the provided initial value.
         * @param initial - The initial value of the signal.
         */
        constructor(initial) {
            super();
            this.value = initial;
        }
        /**
         * Gets the current value of the State signal.
         * @returns The current value.
         */
        get val() {
            return this.value;
        }
        /**
         * Sets the value of the State signal. Notifies followers of the change if the value is different.
         * @param value - The new value to set.
         */
        set val(value) {
            if (this.value !== (this.value = value)) {
                for (let follower of this.followers) {
                    follower(value);
                }
            }
        }
        /**
         * Subscribes to updates from the State signal.
         * @param follower - A function that receives the updated value.
         * @param immediate - If true, the follower is called immediately with the current value.
         * @returns A function to unsubscribe from the signal updates.
         */
        follow(follower, immediate) {
            if (immediate) {
                follower(this.value);
            }
            this.followers.add(follower);
            return () => {
                this.followers.delete(follower);
            };
        }
    }
    Signal.State = State;
    class Readonly extends Signal {
        follow;
        /**
         * Initializes a new Readonly signal with the provided follow handler.
         * @param followHandler - A function defining how the readonly signal is followed.
         */
        constructor(followHandler) {
            super();
            this.follow = followHandler;
        }
    }
    Signal.Readonly = Readonly;
    class Computed extends Readonly {
        /**
         * Initializes a new Computed signal that derives its value using the provided getter function.
         * @param getter - A function that computes the signal's value.
         * @param dependencies - An array of signals that this computed signal depends on.
         */
        constructor(getter, dependencies) {
            let depsArray = dependencies;
            super((follower, immediate) => {
                if (immediate) {
                    follower(getter());
                }
                let unfollows = [];
                let cache;
                for (let dependency of depsArray) {
                    unfollows.push(dependency.follow(() => {
                        if (cache !== (cache = getter())) {
                            follower(cache);
                        }
                    }));
                }
                return () => {
                    for (let unfollow of unfollows) {
                        unfollow();
                    }
                };
            });
        }
    }
    Signal.Computed = Computed;
})(Signal || (Signal = {}));
/**
 * Creates a new `State` signal with the provided initial value.
 *
 * @template T - The type of the signal's value.
 * @param initial - The initial value of the signal.
 * @returns A new `State` signal.
 *
 * @example
 * const count = ref(0); // Creates a state signal with initial value 0.
 */
export let ref = (initial) => new Signal.State(initial);
/**
 * Creates a new `Computed` signal that calculates its value using the provided callback function.
 *
 * @template T - The type of the signal's value.
 * @param callback - The function that computes the signal's value.
 * @param dependencies - An array of signals that the computed signal depends on.
 * @returns A new `Computed` signal.
 *
 * @example
 * const doubleCount = computed(() => count.val * 2, [count]); // Creates a computed signal that doubles `count`.
 */
export let computed = (callback, dependencies) => new Signal.Computed(callback, dependencies);
/**
 * Creates a readonly Signal that can be followed but not directly modified.
 * This is useful for exposing a signal's value without allowing changes.
 *
 * @template T - The type of the signal's value.
 * @param followHandler - A function defining how the readonly signal is followed.
 * @returns A new Readonly signal.
 *
 * @example
 * ```ts
 * // Create a readonly signal that reflects the video player's play state.
 * const isPlayingSignal = readonly<boolean>((follower, immediate) => {
 *   const onPlayPause = () => follower(videoElement.paused === false);
 *   if (immediate) onPlayPause();
 *   videoElement.addEventListener("play", onPlayPause);
 *   videoElement.addEventListener("pause", onPlayPause);
 *   return () => {
 *     videoElement.removeEventListener("play", onPlayPause);
 *     videoElement.removeEventListener("pause", onPlayPause);
 *   };
 * });
 *
 * // Consumers can follow `isPlayingSignal` but cannot modify its value.
 * isPlayingSignal.follow(isPlaying => console.log(`Playing: ${isPlaying}`));
 * ```
 */
export let readonly = (followHandler) => new Signal.Readonly(followHandler);
/**
 * Creates a new signal that resolves its value when the provided promise resolves.
 *
 * @template T - The type of the promise's resolved value.
 * @template U - The type of the `until` value used before the promise resolves.
 * @param promise - The promise to await.
 * @param until - The value to use until the promise resolves. Defaults to `null`.
 * @returns A new signal that resolves to the promise's value or `until` value before the promise is fulfilled.
 *
 * @example
 * const data = awaited(fetchData(), null); // Creates a signal that holds the fetched data once the promise resolves.
 */
export let awaited = (promise, until = null) => {
    let signal = ref(until);
    promise.then((value) => (signal.val = value));
    return signal;
};
