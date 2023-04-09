import { createOrGetDeriveOfFunction } from "../signal/derive"
import { isRenderable, RenderSymbol } from "./renderable"

const EMPTY_NODE = document.createDocumentFragment()

export function valueToNode(value: unknown): Node {
	if (value === null) return EMPTY_NODE
	if (value instanceof Node) return value

	if (value instanceof Array) {
		const fragment = document.createDocumentFragment()
		fragment.append(...value.map((item) => valueToNode(item)))
		return fragment
	}

	if (typeof value === "function") return valueToNode(createOrGetDeriveOfFunction(value as () => unknown))

	if (isRenderable(value)) return valueToNode(value[RenderSymbol]())

	return document.createTextNode(`${value}`)
}
