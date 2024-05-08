/**
 * @template T
 * @typedef Signal.Unfollow
 * @type {() => void}
 */

/**
 * @template T
 * @typedef Signal.Follower
 * @type {(value: T) => void}
 */

/**
 * @template T
 * @typedef Signal.Follow
 * @type {(follower: Signal.Follower<T>) => Signal.Unfollow<T>}
 */

/**
 * @template T
 * @typedef Signal
 * @type {{
 *  follow: Signal.Follow<T>,
 *  emit(): void
 *  readonly val: T
 * }}
 */

/**
 * @template T
 * @typedef Signal.Mut
 * @type {{
 *  follow: Signal.Follow<T>,
 *  emit(): void
 *  val: T
 * }}
 */

/** @type {WeakSet<any>} */
const signals = new WeakSet()

/**
 * @template T
 * @param {T} value
 * @returns {Signal.Mut<T>}
 */
export function ref(value) {
    /** @type {Set<Signal.Follower<T>>} */
    const followers = new Set()

    /** @type {Signal.Mut<T>} */
    const self = {
        follow(follower) {
            followers.add(follower)
            follower(value)
            return () => followers.delete(follower)
        },
        emit() {
            for (const follower of followers) {
                follower(value)
            }
        },
        get val() {
            return value
        },
        set val(newValue) {
            const updated = value !== newValue
            value = newValue
            if (updated) self.emit()
        },
    }

    signals.add(self)
    return self
}

/**
 * @param {unknown} value
 * @returns {value is Signal<unknown>}
 */
export function isSignal(value) {
    return signals.has(value)
}
