import { uniqueId } from "../../utils/id"
import { TemplateToken } from "./tokenizer"

export type TemplateShape = {
	html: string
	items: TemplateShape.Item[]
	refDataMap: Map<string, TemplateShape.RefData>
}
export namespace TemplateShape {
	export type RefData = {
		attributes: Map<string, AttributeData>
	}

	export type AttributeData = {
		indexes: number[]
		parts: (number | string)[] | null
	}

	export type Item = Attribute | Directive | RenderElement | RenderNode
	export type Attribute = {
		itemType: "attr"
		name: string
		quote: "'" | '"' | ""
		ref: string
	}
	export type Directive = {
		itemType: "dir"
		directiveType: Directive.Type
		name: string
		ref: string
	}
	export namespace Directive {
		export type Type = (typeof types)[number]
		export const types = ["class", "style", "on", "ref", "bind"] as const
		const typesSet = new Set(types)
		export function getType(type: string): Type | null {
			if (typesSet.has(type as any)) return type as Type
			return null
		}
	}
	export type RenderElement = {
		itemType: "el"
		ref: string
	}
	export type RenderNode = {
		itemType: "node"
		ref: string
	}
}

export function createTemplateShape(tokens: TemplateToken[]): TemplateShape {
	let html = ""

	try {
		const refDataMap: TemplateShape["refDataMap"] = new Map()
		const items: TemplateShape["items"] = new Array(Math.max(0, tokens.length - 1))

		for (let i = 0; i < tokens.length; i++) {
			const parsePart = tokens[i]!
			html += parsePart.html

			let refData = refDataMap.get(parsePart.state.ref)
			if (!refData) refDataMap.set(parsePart.state.ref, (refData = { attributes: new Map() }))

			if (!(i < items.length)) break

			if (parsePart.state.type === TemplateToken.State.Type.Outer) {
				const ref = uniqueId()
				html += `<x ref:${ref}></x>`
				items[i] = {
					itemType: "node",
					ref,
				}
				continue
			} else if (parsePart.state.type === TemplateToken.State.Type.TagInner && !parsePart.state.attributeName) {
				if (parsePart.state.tag === "x") {
					const ref = parsePart.state.ref
					items[i] = {
						itemType: "el",
						ref,
					}
					continue
				}
			} else if (
				parsePart.state.type > TemplateToken.State.Type.ATTR_VALUE_START &&
				parsePart.state.type < TemplateToken.State.Type.ATTR_VALUE_END
			) {
				const attributeNameParts = parsePart.state.attributeName.split(":")
				const quote =
					parsePart.state.type === TemplateToken.State.Type.AttributeValueUnquoted
						? ""
						: parsePart.state.type === TemplateToken.State.Type.AttributeValueSingleQuoted
						? "'"
						: '"'
				if (attributeNameParts.length === 2) {
					if (quote !== "") throw new Error("Directive value must be unquoted")
					html += `""`
					const ref = parsePart.state.ref
					const type = attributeNameParts[0]!
					const name = attributeNameParts[1]!
					const directiveType = TemplateShape.Directive.getType(type)
					if (!directiveType) throw new Error(`Unknown directive type "${type}".`)
					items[i] = {
						itemType: "dir",
						directiveType,
						name,
						ref,
					}
					continue
				} else {
					const ref = parsePart.state.ref
					const name = attributeNameParts[0]!
					if (quote === "") html += `""`
					else {
						html += ref // using the tag ref as a separator or placeholder for the value
						let attributeData = refData.attributes.get(name)
						if (!attributeData) refData.attributes.set(name, (attributeData = { indexes: [], parts: null }))
						attributeData.indexes.push(i)
					}
					items[i] = {
						itemType: "attr",
						name,
						quote,
						ref,
					}
					continue
				}
			}

			throw new Error(`Unexpected value`)
		}

		return {
			items: items,
			refDataMap,
			html,
		}
	} catch (error) {
		console.error("Error while parsing template:", error, "At:", html.slice(-256).trim())
		throw error
	}
}