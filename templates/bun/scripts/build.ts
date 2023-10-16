import { mkdir, rm } from "fs/promises"
import { Config } from "./config"

const output = await Bun.build({
	entrypoints: [Config.srcApp],
	minify: true,
	target: "browser"
}).then((output) => output.outputs[0]?.text())

if (!output) throw new Error("No output")

const html = await Bun.file(Config.srcHtml).text()
const newHtml = html.replace("<!-- js -->", () => `<script type="module">${output}</script>`)

await rm(Config.outDir, { recursive: true })
await mkdir(Config.outDir, { recursive: true })
await Bun.write(Config.out, newHtml)

console.log("Build complete")
console.log(`app.js: ${(output.length / 1024).toFixed(2)} KB`)
