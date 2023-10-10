import { Signal, isSignal } from "../core"

type Flatten<T> = T extends Signal<infer U> ? Flatten<U> : T

export function flatten<T>(signal: Signal<T>) {
	let value: Signal<unknown> = signal
	while (isSignal(value.ref)) value = value.ref
	return value as Signal<Flatten<T>>
}
