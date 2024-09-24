let trackerStack = [];
export class Signal {
    start() { }
    #stop;
    track() {
        trackerStack.at(-1)?.add(this);
    }
    #followers = new Set();
    follow(follower, immediate) {
        let self = this;
        let followers = self.#followers;
        if (immediate) {
            follower(self.val);
        }
        followers.add(follower);
        if (followers.size === 1) {
            this.#stop = self.start();
        }
        return () => {
            if (followers.delete(follower) && !followers.size) {
                self.#stop?.();
            }
        };
    }
    emit(value = this.val) {
        for (let follower of this.#followers) {
            follower(value);
        }
    }
}
(function (Signal) {
    class State extends Signal {
        value;
        constructor(value) {
            super();
            this.value = value;
        }
        get val() {
            this.track();
            return this.value;
        }
        set val(value) {
            let self = this;
            // Updates value and checks if it has changed
            if (self.value !== (self.value = value)) {
                self.emit();
            }
        }
    }
    Signal.State = State;
    const Outdated = Symbol();
    class Compute extends Signal {
        getter;
        constructor(getter) {
            super();
            this.getter = getter;
        }
        #dependencies = new Map();
        #cache = Outdated;
        #updateAndTrack() {
            let self = this;
            let dependencies = self.#dependencies;
            let trackedSet = new Set();
            trackerStack.push(trackedSet);
            let value = self.getter();
            trackerStack.pop();
            trackedSet.delete(self);
            // Updates value and checks if it has changed
            if (self.#cache !== (self.#cache = value)) {
                self.emit();
            }
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
                dependencies.set(dependency, dependency.follow(() => self.#updateAndTrack()));
            });
        }
        start(self = this) {
            self.#updateAndTrack();
            return () => {
                self.#cache = Outdated;
                let dependencies = self.#dependencies;
                dependencies.forEach((unfollow) => unfollow());
                dependencies.clear();
            };
        }
        get val() {
            let self = this;
            self.track();
            if (self.#cache === Outdated) {
                setTimeout(self.follow(() => 0), 5000);
            }
            return self.#cache;
        }
    }
    Signal.Compute = Compute;
})(Signal || (Signal = {}));
/**
 * Creates a new State signal with the provided initial value.
 * @template T - The type of the signal's value.
 * @param initial - The initial value of the signal.
 * @returns A new State signal.
 * @example
 * const count = ref(0);
 */
export let ref = (initial) => new Signal.State(initial);
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
