import { FOR_EACH, REMOVE, doc, weakMap, weakSet } from "./helpers"

export namespace Lifecycle {
    export type Connectable = Element | CharacterData
    export type OnConnected = () => void | Cleanup
    export type Cleanup = () => void
    export type Item =
        | [connected: Lifecycle.OnConnected, cleanup: Lifecycle.Cleanup]
        | [connected: Lifecycle.OnConnected]
        | [connected: Lifecycle.OnConnected, void]
}

let lifecycleListeners = weakMap<Node, Lifecycle.Item[]>()
export let onConnected$ = <T extends Lifecycle.Connectable>(
    node: T,
    listener: Lifecycle.OnConnected,
): void => {
    let lifecycleItem: Lifecycle.Item = [() => (lifecycleItem[1] = listener())]
    node.isConnected && lifecycleItem[0]()
    lifecycleListeners.get(node)?.push(lifecycleItem) ??
        lifecycleListeners.set(node, [lifecycleItem])
}

if (doc) {
    let connected = weakSet<Node>()
    /**
     * @param tupleIndex 0 = connected, 1 = disconnected
     */
    let callFnOnTree = (node: Node, tupleIndex: 0 | 1): Node => (
        (tupleIndex as unknown as boolean) == !connected.has(node) ||
            (lifecycleListeners
                .get(node)
                ?.[FOR_EACH]((callbacks) => callbacks[tupleIndex]?.()),
            Array.from((node as Element).shadowRoot?.childNodes ?? [])[FOR_EACH](
                (childNode) => callFnOnTree(childNode, tupleIndex),
            ),
            Array.from(node.childNodes)[FOR_EACH]((childNode) =>
                callFnOnTree(childNode, tupleIndex),
            ),
            tupleIndex ? connected.delete(node) : connected.add(node)),
        node
    )

    let mutationObserver = new MutationObserver((mutations) =>
        mutations[FOR_EACH](
            (mutation) => (
                mutation.addedNodes[FOR_EACH]((addedNode) => callFnOnTree(addedNode, 0)),
                mutation.removedNodes[FOR_EACH]((removedNode) =>
                    callFnOnTree(removedNode, 1),
                )
            ),
        ),
    )

    let observe = <T extends Node>(root: T): T => (
        mutationObserver.observe(root, {
            characterData: true,
            childList: true,
            subtree: true,
        }),
        root
    )

    observe(doc)
    /* 
        OGAA BOOGA ME LIKE ROCK 🪨
    */
    let ATTACH_SHADOW = "attachShadow" as const
    let PROTOTYPE = "prototype" as const
    let elementPrototype = Element[PROTOTYPE]
    let elementAttachShadow = elementPrototype[ATTACH_SHADOW]
    let elementRemove = elementPrototype[REMOVE]
    let characterDataPrototype = CharacterData[PROTOTYPE]
    let characterDataRemove = characterDataPrototype[REMOVE]
    elementPrototype[ATTACH_SHADOW] = function (this, ...args) {
        return observe(elementAttachShadow.apply(this, args))
    }
    elementPrototype[REMOVE] = function (this) {
        return elementRemove.call(callFnOnTree(this, 1))
    }
    characterDataPrototype[REMOVE] = function (this) {
        return characterDataRemove.call(callFnOnTree(this, 1))
    }
}
