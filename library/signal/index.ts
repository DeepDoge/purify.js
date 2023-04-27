import { randomId } from "../utils/id"

export type SignalSubscription = {
	unsubscribe(): void
}
export type SignalSubscriptionListener<T> = {
	<U extends T>(value: U): unknown
}
export type SignalSubscriptionOptions = {
	mode: "normal" | "once" | "immediate"
}

export type SignalSetter<T> = {
	<U extends T>(value: U): void
}

export type SignalUpdater<T> = {
	(set: SignalSetter<T>, signal: SignalReadable<T>["signal"]): Function
}

/**
 * @internal
 */
export const signalSyncContextStack: Set<SignalReadable>[] = []
export type SignalReadable<T = unknown> = {
	get id(): string
	get(): T
	get ref(): T
	get value(): T
	subscribe(listener: SignalSubscriptionListener<T>, options?: SignalSubscriptionOptions): SignalSubscription
	signal(): void
	get listenerCount(): number
	listeners: Set<SignalSubscriptionListener<T>>
}
export type SignalWritable<T = unknown> = SignalReadable<T> & {
	set(value: T): void
	set ref(value: T)
}
const readables = new WeakSet<SignalReadable>()
const writables = new WeakSet<SignalWritable>()

export function isWritable(value: unknown): value is SignalWritable {
	return writables.has(value as SignalWritable)
}
export function isReadable(value: unknown): value is SignalReadable {
	return readables.has(value as SignalReadable)
}

const signalling = new WeakSet<SignalReadable>()
export function createWritable<T>(initial: T) {
	const listeners = new Set<SignalSubscriptionListener<T>>()
	let value = initial

	const self: SignalWritable<T> = {
		id: randomId(),
		get value() {
			return value
		},
		listeners,
		get listenerCount() {
			return listeners.size
		},
		get() {
			if (signalSyncContextStack.length > 0) signalSyncContextStack[signalSyncContextStack.length - 1]!.add(self)
			return value
		},
		set(newValue) {
			if (value === newValue) return
			value = newValue
			self.signal()
		},
		get ref() {
			return self.get()
		},
		set ref(newValue) {
			self.set(newValue)
		},
		subscribe(listener, options) {
			switch (options?.mode) {
				case "once":
					const onceCallback = () => {
						listener(self.get())
						listeners.delete(onceCallback)
					}
					listeners.add(onceCallback)
					break
				case "immediate":
					listener(self.get())
				case "normal":
				default:
					listeners.add(listener)
					break
			}
			return {
				unsubscribe: () => {
					console.log("%cunsubscribed", "color:orange", listener.name, "from", self.id)
					listeners.delete(listener)
				},
			}
		},
		signal() {
			if (signalling.has(self)) throw new Error("Avoided recursive signalling.")
			signalling.add(self)
			console.log("%csignalling", "color:blue", self.id)
			listeners.forEach((callback) => callback(self.get()))
			signalling.delete(self)
		},
	}
	writables.add(self)
	readables.add(self)
	return self
}

export function createReadable<T>(updater: SignalUpdater<T>, initial?: T) {
	const base = createWritable<T>(initial!)
	let cleaner: Function | null = null

	function tryActivate() {
		if (cleaner) return false
		console.log("%cactiving", "color:red", self.id)
		cleaner = updater(base.set, self.signal)
		console.log("%cactiveted", "color:red", self.id)
		return true
	}

	function tryDeactivate() {
		if (!cleaner) return false
		if (base.listenerCount > 0) return false
		console.log("%cdeactivating", "color:red", self.id)
		cleaner()
		cleaner = null
		console.log("%cdeactivated", "color:red", self.id)
		return true
	}

	const self: SignalReadable<T> = {
		get id() {
			return base.id
		},
		get value() {
			return base.value
		},
		get listenerCount() {
			return base.listenerCount
		},
		listeners: base.listeners,
		get() {
			if (tryActivate()) setTimeout(tryDeactivate, 5000)
			return base.get()
		},
		get ref() {
			return self.get()
		},
		subscribe(...args) {
			const subscription = base.subscribe(...args)
			tryActivate()
			return {
				unsubscribe: () => {
					subscription.unsubscribe()
					tryDeactivate()
				},
			}
		},
		signal() {
			base.signal()
		},
	}
	readables.add(self)
	return self
}