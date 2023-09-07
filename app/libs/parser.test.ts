import { deepStrictEqual } from "node:assert"
import { test } from "node:test"
import type { ParseDocumentation } from "./parser"
import { parseDocumentation } from "./parser"

test("parseDocumentation", () => {
	return
	const src = `
//#region Hello

abc
123
/*
Hello
*/

//#region World

/* World */
/* World2 */

//#endregion

{
	if (true) {
		hello()
	}
}

export function hello() {
	console.log("Hello")
}

//#endregion



`

	const expect: ParseDocumentation.Item[] = [
		{
			type: "region",
			name: "Hello",
			items: [
				{
					type: "comment",
					content: "Hello"
				},
				{
					type: "region",
					name: "World",
					items: [
						{
							type: "comment",
							content: "World"
						},
						{
							type: "comment",
							content: "World2"
						}
					]
				},
				{
					type: "code",
					content: "\n\tif (true) {\n\t\thello()\n\t}\n"
				},
				{
					type: "demo",
					name: "hello",
					content: 'function hello() {\n\tconsole.log("Hello")\n}'
				}
			]
		}
	]

	deepStrictEqual(parseDocumentation(src), expect)
})
