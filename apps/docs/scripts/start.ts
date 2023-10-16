import { Config } from "./config"

import "./build"

const output = await Bun.file(Config.out).arrayBuffer()

Bun.serve({
	development: true,
	fetch() {
		return new Response(output)
	}
})

process.on("SIGINT", process.exit)
