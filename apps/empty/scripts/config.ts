import path from "path"

export namespace Config {
    export const root = path.resolve(path.join(import.meta.dir, ".."))
    export const srcDir = path.join(root, "src")
    export const srcApp = path.join(srcDir, "app.ts")

    export const outDir = path.join(Config.root, "out", "bun")
    export const out = path.join(outDir, "app.js")
}
