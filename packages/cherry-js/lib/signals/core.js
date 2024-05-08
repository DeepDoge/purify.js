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
 * @type {(follower: Signal.Follower<T>, immediate?: boolean) => Signal.Unfollow<T>}
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

/**
 * @template T
 * @typedef Signal.Cleanup
 * @type {() => unknown}
 */

/**
 * @template T
 * @typedef Signal.Updater
 * @type {(set: (value: T) => void) => Signal.Cleanup<T>}
 */

/** @type {WeakSet<any>} */
const signals = new WeakSet()

/**
 * @param {unknown} value
 * @returns {value is Signal<unknown>}
 */
export function isSignal(value) {
    return signals.has(value)
}

/**
 * @template T
 * @param {T} value
 * @param {Signal.Updater<T>} [updater]
 * @returns {Signal.Mut<T>}
 */
export function ref(value, updater) {
    /** @type {Set<Signal.Follower<T>>} */
    const followers = new Set()

    /** @type {Signal.Cleanup<T> | null | undefined} */
    let cleanup

    function deactivate() {
        if (followers.size) return
        cleanup?.()
        cleanup = null
    }
    function activate() {
        cleanup ??= updater?.((newValue) => (self.val = newValue))
        return deactivate
    }

    /** @type {Signal.Mut<T>} */
    const self = {
        follow(follower, immediate) {
            activate()
            followers.add(follower)
            if (immediate) follower(value)
            return () => {
                followers.delete(follower)
                deactivate?.()
            }
        },
        emit() {
            for (const follower of followers) {
                follower(value)
            }
        },
        get val() {
            if (!deactivate) setTimeout(activate(), 5000)
            trackerStack.at(-1)?.add(self)
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
 * @type {Set<Signal<unknown>>[]}
 */
const trackerStack = []

/**
 * @template T
 * @param {() => T} value
 * @returns {Signal<T>}
 */
export function derived(value) {
    /** @type {Map<Signal<unknown>, Signal.Unfollow<unknown>>} */
    let dependencies = new Map()

    /** @type {*} */
    let current = 0

    const self = ref(current, (set) => {
        console.log("active")
        update()
        function update() {
            /** @type {Set<Signal<unknown>>} */
            const trackedSet = new Set()
            trackerStack.push(trackedSet)
            current = value()
            trackerStack.pop()
            trackedSet.delete(self)

            for (const [dependency, unfollow] of dependencies) {
                if (!trackedSet.has(dependency)) {
                    unfollow()
                    dependencies.delete(dependency)
                }
            }

            for (const dependency of trackedSet) {
                if (!dependencies.has(dependency)) {
                    dependencies.set(dependency, dependency.follow(update))
                }
            }

            set(current)
        }

        return () => {
            for (const unfollow of dependencies.values()) {
                unfollow()
            }
            dependencies.clear()
        }
    })
    return self
}
