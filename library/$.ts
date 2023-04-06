import { createAwait } from "./logic/await"
import { createDeferred } from "./signal/deferred"
import { createDerive } from "./signal/derive"
import { createEach } from "./logic/each"
import { createMatch } from "./logic/match"
import { createReadable } from "./signal/readable"
import { createSwitch } from "./logic/switch"
import { createWritable } from "./signal/writable"

export const $ = {
	writable: createWritable,
	readable: createReadable,
	derive: createDerive,
	deferred: createDeferred,
	switch: createSwitch,
	match: createMatch,
	each: createEach,
	await: createAwait,
}