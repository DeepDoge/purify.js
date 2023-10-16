import { Config } from "./config"

import "./build"

const output = await Bun.file(Config.out).text()

Bun.serve({
	development: true,
	fetch() {
		return new Response(output, { headers: { "Content-Type": "text/html" } })
	}
})

process.on("SIGINT", process.exit)
