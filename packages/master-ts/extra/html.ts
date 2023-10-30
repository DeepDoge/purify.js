import { Template, populate, tagsNS } from "master-ts/core.ts"

let counter = 0n
let uniqueId = () => Math.random().toString(36).slice(2) + (counter++).toString(36)
document.createNodeIterator
export let html = (strings: TemplateStringsArray, ...values: HtmlTemplate.Value[]) => {
	let placeholders: string[] = new Array(values.length)
	let rawHtml = strings
		.map((part, i) => part + (i < placeholders.length ? (placeholders[i] = `x${uniqueId()}`) : ""))
		.join("")
		.trim()

	let fn = () => {
		let args = { p: placeholders, v: values, i: 0 } as const satisfies HydrateArgs
		let template = tagsNS.template()
		template.innerHTML = rawHtml
		return Array.from(template.content.childNodes)
			.map((node) => hydrate(node, args))
			.flat()
	}

	return fn()
}

export namespace HtmlTemplate {
	export type Value = Template.Member | EventListener | Function
}

interface HydrateArgs {
	/**
	 * @name placeholders
	 */
	p: string[]
	/**
	 * @name values
	 */
	v: HtmlTemplate.Value[]
	/**
	 * @name index
	 */
	i: number
}

let hydrate = (node: Node, args: HydrateArgs): Template.Member[] => {
	if (node instanceof CharacterData) {
		let text = node.nodeValue!
		let i = 0
		let result: Template.Member[] | undefined

		let placeholderIndex: number
		while (i < text.length && (placeholderIndex = text.indexOf(args.p[args.i]!, i)) >= 0) {
			result ??= []
			result.push(document.createTextNode(text.slice(i, placeholderIndex)), args.v[args.i++] as Template.Member)
			i = placeholderIndex + args.p[args.i - 1]!.length
		}
		return result ? (result.push(document.createTextNode(text.slice(i))), node.remove(), result) : [node]
	}

	if (node instanceof Element) {
		// NOTE: Order here is important, attributes must be processed before children
		// 		because attributes are always before children in the raw html
		let attributes = Array.from(node.attributes).reduce(
			(attr, { name, value }) => ((attr[name] = value === args.p[args.i] ? args.v[args.i++] : value), attr),
			{} as Template.Attributes<Element>
		)
		let children = Array.from(node.childNodes)
			.map((childNode) => hydrate(childNode, args))
			.flat()

		return [
			populate(
				node.tagName === "X"
					? (node.remove(), args.v[args.i++] as Element)
					: (node.attributes.getNamedItem(args.p[args.i]!) && args.i++, node),
				attributes,
				children
			)
		]
	}

	return [node]
}
