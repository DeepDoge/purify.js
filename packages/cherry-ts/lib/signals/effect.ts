import { FOLLOW$, FOLLOW_IMMEDIATE_OPTIONS } from "../helpers"
import { Lifecycle } from "../lifecyle"
import { derive } from "./signal"

export let effect$ = (
    node: Lifecycle.Connectable,
    ...args: Parameters<typeof derive>
): void => derive(...args)[FOLLOW$](node, () => {}, FOLLOW_IMMEDIATE_OPTIONS)
