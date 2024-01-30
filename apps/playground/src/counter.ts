import { signal, Tags } from "cherry-ts"

const { div, button } = Tags

function Counter() {
    const count = signal(0)

    const increment = () => {
        count.ref = count.ref + 1
    }

    return div([
        `Count: ${count}`,
        button(
            {
                "on:click": increment,
            },
            ["Increment"],
        ),
    ])
}

document.body.appendChild(Counter())
