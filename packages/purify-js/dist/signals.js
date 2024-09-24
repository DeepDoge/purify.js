export class Signal {
    get val() {
        let returns;
        this.follow((value) => (returns = value), true)();
        /// @ts-ignore // We know `follow` for will sure assign `returns` so ignore the error
        return returns;
    }
    /**
     * Creates a new computed Signal derived from the current Signal's value using the provided getter function.
     * This allows for more complex transformations of the signal's value.
     *
     * @template U - The type of the derived signal's value.
     * @param getter - A function that receives the current value of the signal and returns the derived value.
     * @returns A new Compute signal that reflects changes in the source signal.
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
        constructor(initial) {
            super();
            this.value = initial;
        }
        get val() {
            return this.value;
        }
        set val(value) {
            if (this.value !== (this.value = value)) {
                for (let follower of this.followers) {
                    follower(value);
                }
            }
        }
        followers = new Set();
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
        constructor(followHandler) {
            super();
            this.follow = followHandler;
        }
    }
    Signal.Readonly = Readonly;
    class Computed extends Readonly {
        constructor(getter, depsArray) {
            let dependencies = depsArray;
            super((follower, immediate) => {
                if (immediate) {
                    follower(getter());
                }
                let unfollows = [];
                let cache;
                for (let dependency of dependencies) {
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
 * Creates a new `Compute` signal that computes its value using the provided callback function.
 *
 * @template T - The type of the signal's value.
 * @param callback - The function that computes the signal's value.
 * @param dependencies - An array of signals that the computed signal depends on.
 * @returns A new `Compute` signal.
 *
 * @example
 * const doubleCount = computed(() => count.val * 2, [count]); // Creates a computed signal that doubles `count`.
 */
export let computed = (callback, dependencies) => new Signal.Computed(callback, dependencies);
/**
 * Creates a readonly Signal that can be followed but not directly modified.
 * Useful for exposing a signal's value without allowing changes.
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
