import type { Signal, SignalOrValueOrFn } from "master-ts/core.ts"
import { derive, isSignalOrFn, signal, signalFrom } from "master-ts/core.ts"
import { flatten } from "./"

export let awaited: {
	<T>(promise: SignalOrValueOrFn<Promise<T>>): Signal<T | null>
	<T, U>(promise: SignalOrValueOrFn<Promise<T>>, until: U): Signal<T | U>
} = (promise: SignalOrValueOrFn<Promise<unknown>>, until: unknown = null): Signal<unknown> => {
	if (isSignalOrFn(promise)) {
		const promiseSignal = signalFrom(promise)
		return flatten(derive(() => awaited(promiseSignal.ref, until), [promiseSignal]))
	}
	const promiseSignal = signal(until)
	promise.then((value) => (promiseSignal.ref = value))
	return promiseSignal
}
