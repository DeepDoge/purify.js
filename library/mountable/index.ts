import type { SignalReadable, SignalSubscription, SignalSubscriptionListener, SignalSubscriptionOptions } from "../signal/readable"

export type UnknownListenerWithCleanup = ListenerWithCleanup<Function | void>
export type ListenerWithCleanup<R extends Function | void> = {
	(): R
}

const EMIT_MOUNT = Symbol("mount")
type EMIT_MOUNT = typeof EMIT_MOUNT
const EMIT_UNMOUNT = Symbol("unmount")
type EMIT_UNMOUNT = typeof EMIT_UNMOUNT

type NodePlace = typeof NODE_IN_DOM | typeof NODE_NOT_IN_DOM
const NODE_IN_DOM = 0
const NODE_NOT_IN_DOM = 1

{
	const mountUnmountObserver = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			Array.from(mutation.removedNodes).forEach(removedNode)
			Array.from(mutation.addedNodes).forEach((node) => addedNode(node, NODE_NOT_IN_DOM))
		}
	})
	mountUnmountObserver.observe(document, { childList: true, subtree: true })
	const originalAttachShadow = Element.prototype.attachShadow
	Element.prototype.attachShadow = function (options: ShadowRootInit) {
		const shadowRoot = originalAttachShadow.call(this, options)
		if (options.mode === "open") mountUnmountObserver.observe(shadowRoot, { childList: true, subtree: true })
		return shadowRoot
	}

	function addedNode(node: Node, place: NodePlace) {
		if (place === NODE_NOT_IN_DOM && getRootNode(node) !== document) return
		if (isMountableNode(node)) node[EMIT_MOUNT]()
		Array.from(node.childNodes).forEach((node) => addedNode(node, NODE_IN_DOM))
		if (node instanceof HTMLElement) Array.from(node.shadowRoot?.childNodes ?? []).forEach((node) => addedNode(node, NODE_IN_DOM))
	}

	function removedNode(node: Node) {
		if (isMountableNode(node)) node[EMIT_UNMOUNT]()
		Array.from(node.childNodes).forEach(removedNode)
		if (node instanceof HTMLElement) Array.from(node.shadowRoot?.childNodes ?? []).forEach(removedNode)
	}

	function getRootNode(node: Node): Node {
		if (node instanceof ShadowRoot) return getRootNode(node.host)
		if (node.parentNode) return getRootNode(node.parentNode)
		return node
	}
}

export type MountableNode = Node & {
	get $mounted(): boolean | null
	[EMIT_MOUNT](): void
	[EMIT_UNMOUNT](): void
	$onMount<T extends UnknownListenerWithCleanup>(listener: T): void
	$onUnmount<T extends UnknownListenerWithCleanup>(listener: T): void
	$subscribe<T>(signal: SignalReadable<T>, listener: SignalSubscriptionListener<T>, options?: SignalSubscriptionOptions): void
	$effect<T extends SignalReadable<any>[]>(callback: () => void, options?: SignalSubscriptionOptions | null, ...signals: T): void
	$interval<T>(callback: () => T, delay: number): void
	$timeout<T>(callback: () => T, delay: number): void
}

const mountableNodes = new WeakSet<MountableNode>()
export function isMountableNode<T extends Node>(node: T): node is T & MountableNode {
	return mountableNodes.has(node as never)
}

export function makeMountableNode<T extends Node>(node: T): asserts node is T & MountableNode {
	if (isMountableNode(node)) return
	type Impl = Pick<MountableNode, Exclude<keyof MountableNode, keyof Node>>
	let _mounted: boolean | null = null
	const _onMountListeners: Function[] = []
	const _onUnmountListeners: Function[] = []

	const impl: Impl = {
		get $mounted() {
			return _mounted
		},
		[EMIT_MOUNT]() {
			if (_mounted) return
			_mounted = true
			_onMountListeners.forEach((listener) => listener())
		},
		[EMIT_UNMOUNT]() {
			if (!_mounted) return
			_mounted = false
			_onUnmountListeners.forEach((listener) => listener())
		},
		$onMount(listener) {
			if (_mounted === true) listener()?.()
			else {
				_onMountListeners.push(() => {
					const cleanup = listener()
					if (cleanup instanceof Function) _onUnmountListeners.push(cleanup)
				})
			}
		},
		$onUnmount(listener) {
			if (_mounted === false) listener()?.()
			else {
				_onUnmountListeners.push(() => {
					const cleanup = listener()
					if (cleanup instanceof Function) _onMountListeners.push(cleanup)
				})
			}
		},
		$subscribe(signal, listener, options) {
			let subscription: SignalSubscription
			this.$onMount(() => {
				subscription = signal.subscribe(listener, options)
			})
			this.$onUnmount(() => subscription.unsubscribe())
		},
		$effect(callback, options, ...signals) {
			let subscriptions: SignalSubscription[] = new Array(signals.length)

			this.$onMount(() => {
				for (let i = 0; i < signals.length; i++) subscriptions[i] = signals[i]!.subscribe(() => callback(), options ?? undefined)
			})
			this.$onUnmount(() => subscriptions.forEach((subscription) => subscription.unsubscribe()))
		},
		$interval(callback, delay) {
			this.$onMount(() => {
				const interval = setInterval(callback, delay)
				return () => clearInterval(interval)
			})
		},
		$timeout(callback, delay) {
			this.$onMount(() => {
				const timeout = setTimeout(callback, delay)
				return () => clearTimeout(timeout)
			})
		},
	}

	mountableNodes.add(Object.assign(node, impl))

	// xx const name = node instanceof Element ? node.tagName : node.nodeValue || node.nodeName
	// xx impl.$onMount(() => console.log("%cmounted", "color:red;font-weight:bold;font-size:12px", name))
	// xx impl.$onUnmount(() => console.log("%cunmounted", "color:blue;font-weight:bold;font-size:12px", name))
}
