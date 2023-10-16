import path from "path"

export function pathJoin(...paths: string[]): string {
	return path.join(...paths)
}

export function getAppDir() {
	return path.resolve(import.meta.dir, "..")
}
