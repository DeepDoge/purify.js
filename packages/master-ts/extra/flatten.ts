import { Signal, derive, isSignal } from "../core"

type Flatten<T> = T extends Signal<infer U> ? Flatten<U> : T

export function flatten<T>(signal: Signal<T>) {
	return derive(() => {
		let value: Signal<unknown> = signal
		while (isSignal(value.ref)) value = value.ref
		return value.ref
	}) as Signal<Flatten<T>>
}
