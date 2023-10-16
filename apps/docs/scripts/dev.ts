import path from "path"

const root = path.resolve(path.join(import.meta.dir, ".."))
const devDirname = `/tmp/${Math.random().toString(36).slice(2)}_bun_dev`
const srcDirname = path.join(root, "src")

Bun.spawn(["bun", "build", "--watch", path.join(srcDirname, "app.ts"), "--target", "browser", "--outdir", devDirname], {
	stdout: "inherit",
	stderr: "inherit"
})

Bun.serve({
	development: true,
	async fetch() {
		const output = await Bun.file(path.join(devDirname, "app.js")).arrayBuffer()

		return new Response(
			await Bun.file(path.join(srcDirname, "index.html"))
				.text()
				.then((html) => html.replace("<!-- js -->", () => `<script type="module">${output}</script>`)),
			{ headers: { "Content-Type": "text/html" } }
		)
	}
})

process.on("SIGINT", process.exit)
