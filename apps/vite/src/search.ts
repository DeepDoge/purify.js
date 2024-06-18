import { awaited, computed, css, fragment, ref, sheet, tags } from "purify-js"

const { input, div, ul, li } = tags

function SearchInput(text = ref("")) {
    return input({ type: "search" })
        .value(text)
        .oninput((event) => (text.val = event.currentTarget.value))
}

function Loading() {
    return div().children("Loading...")
}

const searchStyle = sheet(css`
    :host {
        display: grid;
        grid-template-columns: minmax(0, 30em);
        place-content: center;
        gap: 1em;
    }

    :host > * {
        display: block;
    }
`)

export function SearchExample() {
    const host = div()
    const shadow = host.element.attachShadow({ mode: "open" })
    shadow.adoptedStyleSheets.push(searchStyle)

    const search = ref("")

    shadow.append(
        fragment(
            SearchInput(search),
            ["Search: ", search],
            computed(() => awaited(SearchResults(search.val), Loading())),
        ),
    )

    return host
}

async function SearchResults(query: string) {
    const result = (await fetch(
        `data:application/json;utf8,${JSON.stringify(
            mockDb.filter((item) => item.toLowerCase().includes(query.toLowerCase())),
        )}`,
    ).then((response) => response.json())) as string[]

    return ul().children(...result.map((item) => li().children(item)))
    // TODO: weird bug here, returning the builder proxy cause returned Promise to never be resolved
}

const mockDb = [
    "Egg",
    "Milk",
    "Bread",
    "Butter",
    "Cheese",
    "Bacon",
    "Beef",
    "Chicken",
    "Pork",
    "Fish",
    "Pasta",
]
