import { Lifecycle } from "../lifecyle"
import { derive } from "./signal"

export let effect$ = (
    node: Lifecycle.Connectable,
    ...args: Parameters<typeof derive>
): void => derive(...args).follow$(node, () => {}, { mode: "immediate" })
