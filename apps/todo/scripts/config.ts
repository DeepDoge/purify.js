import path from "path"

export namespace Config {
    export const root = path.resolve(path.join(import.meta.dir, ".."))
    export const srcDir = path.join(root, "src")
    export const srcHtml = path.join(srcDir, "index.html")
    export const srcApp = path.join(srcDir, "app.ts")
    export const outDir = path.join(root, "dist")
}
