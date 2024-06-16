import { Signal } from "cherry-js/lib/signals/core2"

const count = new Signal.State(0)
const double = new Signal.Compute(() => count.get() * 2)
