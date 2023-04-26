import { createReadable, SignalReadable, SignalSetter, SignalSubscription, signalSyncContextStack } from "."

export type SignalDeriver<T> = { (): T }

export function createDerive<T>(deriver: SignalDeriver<T>, staticDependencies?: SignalReadable<any>[]): SignalReadable<T> {
	let activate: (set: SignalSetter<T>) => void
	let deactivate: () => void

	if (staticDependencies) {
		const subscriptions = new Array<SignalSubscription>(staticDependencies.length)
		activate = (set: SignalSetter<T>) => {
			function update() {
				set(deriver())
			}
			for (let i = 0; i < staticDependencies.length; i++) subscriptions[i] = staticDependencies[i]!.subscribe(update)
			update()
		}
		deactivate = () => {
			for (let i = 0; i < subscriptions.length; i++) {
				subscriptions[i]!.unsubscribe()
				delete subscriptions[i]
			}
		}
	} else {
		const dependencyToSubscriptionMap = new Map<SignalReadable<unknown>, SignalSubscription>()

		activate = (set: SignalSetter<T>) => {
			function update() {
				signalSyncContextStack.push(new Set())
				const value = deriver()
				const syncContext = signalSyncContextStack.pop()!
				syncContext.delete(self)
				for (const [dependency, subscription] of dependencyToSubscriptionMap.entries()) {
					if (syncContext.has(dependency)) {
						syncContext.delete(dependency)
					} else {
						subscription?.unsubscribe()
						dependencyToSubscriptionMap.delete(dependency)
					}
				}
				syncContext.forEach((dependency) => dependencyToSubscriptionMap.set(dependency, dependency.subscribe(update)))

				set(value)
			}
			for (const dependency of dependencyToSubscriptionMap.keys()) dependencyToSubscriptionMap.set(dependency, dependency.subscribe(update))
			update()
		}
		deactivate = () => {
			for (const subscription of dependencyToSubscriptionMap.values()) subscription?.unsubscribe()
			dependencyToSubscriptionMap.clear()
		}
	}

	const self = createReadable<T>((set) => {
		activate(set)
		return deactivate
	})
	return self
}

const deriveOfFunctionCache = new WeakMap<SignalDeriver<unknown>, SignalReadable<any>>()
/**
 * Same as createDerive, but specialized for functions.
 *
 * Derives a signal from a function.
 *
 * Cache is used to ensure that the same signal is returned for the same function.
 *
 * Used internally to convert functions in html to derived signals.
 * @param func The function that derives the value of the signal.
 * @returns The signal that is derived from the function.
 * @example
 * const double = m.deriveFromFunction((s) => s(foo).value * 2)
 **/
export function createOrGetDeriveOfFunction<T extends (...args: any) => any>(func: T): SignalReadable<ReturnType<T>> {
	if (deriveOfFunctionCache.has(func)) return deriveOfFunctionCache.get(func)!
	const computed = createDerive(() => func())
	deriveOfFunctionCache.set(func, computed)
	return computed
}
