/** @type {Set<Signal<*>>[]} */
const trackerStack = []

/**
 * @template [T = unknown]
 * @typedef Signal.State
 * @type {Signal<T> & { val: T }}
 */

/**
 * @template [T = unknown]
 * @typedef Signal.Compute
 * @type {Signal<T>}
 */

/**
 * @template [const T = unknown]
 */
export class Signal {
    static State =
        /**
         * @template T
         * @extends {Signal<T>}
         */
        class State extends Signal {
            /** @param {T} value */
            set val(value) {
                this.#set(value)
            }

            get val() {
                return super.val
            }
        }

    static Compute =
        /**
         * @template T
         * @extends {Signal<T>}
         */
        class Compute extends Signal {
            #dirty = true
            /** @type {Map<Signal<unknown>, import("./signals.js").Signal.Unfollower>} */
            #dependencies = new Map()
            /** @type {import("./signals.js").Signal.Compute.Callback<T>} */
            #callback

            /** @param {import("./signals.js").Signal.Compute.Callback<T>} callback */
            constructor(callback) {
                super(/** @type {*} */ (0))
                this.#callback = callback
            }

            get val() {
                this.#dirty && this.#update()
                return super.val
            }

            #update(self = this) {
                let dependencies = self.#dependencies

                let trackedSet = new Set()
                trackerStack.push(trackedSet)
                let value = self.#callback()
                trackerStack.pop()
                trackedSet.delete(self)
                self.#dirty = false
                self.#set(value)

                // Unfollow and remove dependencies that are no longer being tracked
                dependencies.forEach((unfollow, dependency) => {
                    if (!trackedSet.has(dependency)) {
                        unfollow()
                        dependencies.delete(dependency)
                    }
                })

                // Follow new dependencies
                for (let dependency of trackedSet) {
                    if (!dependencies.has(dependency)) {
                        dependencies.set(
                            dependency,
                            dependency.follow(() =>
                                self.#followers.size
                                    ? self.#update()
                                    : !self.#dirty &&
                                      ((self.#dirty = true),
                                      dependencies.forEach((unfollow, dependency) => {
                                          unfollow()
                                          dependencies.delete(dependency)
                                      })),
                            ),
                        )
                    }
                }
            }
        }

    /** @type {T} */
    #value
    /** @type {Set<import("./signals.js").Signal.Follower<T>>} */
    #followers = new Set()

    /**
     * @param {T} initial
     */
    constructor(initial) {
        this.#value = initial
    }

    /**
     * @param {T} value
     */
    #set(value, self = this) {
        let changed = self.#value !== value
        self.#value = value
        if (changed) self.notify()
    }

    get val() {
        return trackerStack.at(-1)?.add(this), this.#value
    }

    /**
     * @param {import("./signals.js").Signal.Follower<T>} follower
     * @param {boolean} immediate
     * @returns {import("./signals.js").Signal.Unfollower}
     */
    follow = (follower, immediate = false, self = this) => (
        (immediate || !self.#followers.size) && follower(self.val),
        self.#followers.add(follower),
        () => self.#followers.delete(follower)
    )

    notify = (self = this, value = self.val) => {
        for (let follower of self.#followers) {
            follower(value)
        }
    }
}

/**
 * @template T
 * @param {T} value
 */
export let ref = (value) => new Signal.State(value)

/**
 * @template T
 * @param {import("./signals.js").Signal.Compute.Callback<T>} callback
 */
export let computed = (callback) => new Signal.Compute(callback)

/**
 * @template T
 * @template [const U = null]
 * @param {Promise<T>} promise
 * @param {U?} until
 * @param {Signal.State<T | U>=} signal
 * @returns {Signal<T | U>}
 */
export let awaited = (
    promise,
    until = null,
    signal = /** @type {never} */ (ref(until)),
) => {
    promise.then((value) => (signal.val = value))
    return signal
}

/**
 * @template T
 * @param {import("./signals.js").Signal.Compute.Callback<T>} callback
 */
export let effect = (callback) => computed(callback).follow(() => {})
