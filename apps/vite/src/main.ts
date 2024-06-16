import { Signal } from "cherry-js"

const count = new Signal.State(0)
const double = new Signal.Compute(() => count.get() * 2)
