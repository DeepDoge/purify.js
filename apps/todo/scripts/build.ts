import { env } from "bun"
import fs from "node:fs/promises"
import path from "node:path"
import { Config } from "./config"

env["BUN_ENV"] = "production"

await fs.rmdir(Config.outDir, { recursive: true })
const outApp = path.join(Config.outDir, `${path.basename(Config.srcApp, path.extname(Config.srcApp))}.js`)

await Bun.build({
    target: "browser",
    outdir: Config.outDir,
    entrypoints: [Config.srcApp]
})

const output = await Bun.file(outApp).text()

const html = await Bun.file(Config.srcHtml)
    .text()
    .then((html) => html.replace("<!-- js -->", () => `<script type="module">${output}</script>`))

await fs.rmdir(Config.outDir, { recursive: true })
await fs.mkdir(Config.outDir, { recursive: true })

await Bun.write(path.join(Config.outDir, "index.html"), html)
