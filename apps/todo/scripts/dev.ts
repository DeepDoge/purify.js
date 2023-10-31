import path from "path"
import { Config } from "./config"

const devDir = `/tmp/${Math.random().toString(36).slice(2)}_bun_dev`
const devApp = path.join(devDir, `${path.basename(Config.srcApp, path.extname(Config.srcApp))}.js`)

Bun.spawn(["bun", "build", "--watch", Config.srcApp, "--target", "browser", "--outdir", devDir], {
    stdout: "inherit",
    stderr: "inherit"
})

Bun.serve({
    development: true,
    async fetch() {
        const output = await Bun.file(devApp).text()

        return new Response(
            await Bun.file(Config.srcHtml)
                .text()
                .then((html) => html.replace("<!-- js -->", () => `<script type="module">${output}</script>`)),
            { headers: { "Content-Type": "text/html" } }
        )
    }
})

process.on("SIGINT", process.exit)
