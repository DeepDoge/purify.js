import { Tags, fragment, onConnected$, signal } from "cherry-ts"
import { Issue } from "./issue"
import { Todo } from "./todo"

const mySignal = signal(0)
const myInput = Tags.input({ type: "number", valueAsNumber: mySignal })
onConnected$(myInput, () => {
    const interval = setInterval(() => mySignal.ref++, 5000)
    return () => clearInterval(interval)
})

document.body.append(
    Issue(),
    Todo(),
    fragment([myInput, Tags.div([() => mySignal.ref * 2])]),
)
