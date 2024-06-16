import { computed, ref, tags } from "cherry-js"

const { div, button } = tags

const count = ref(0)
const double = computed(() => count.val * 2)

function App() {
    return div().children(Counter())
}

function Counter() {
    return div().children(
        button()
            .on("click", (event) => count.val++)
            .children("Count:", count),
        "Double:",
        double,
    )
}

document.body.append(App().element)
