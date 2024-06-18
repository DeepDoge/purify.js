# purify.js

<p align="center">
    <img width="100px" height="auto" alt="**purify.js** logo" src="#" />
</p>
<p align="center">
    Simplifying JavaScript UI, Empowering Native Features
</p>

## What is purify.js

**purify.js** is a lightweight JavaScript UI library that prioritizes transparency and direct access to native browser features.

## Size ⚡

**purify.js** boasts an incredibly small footprint without the need for a build step. Here's a size comparison with other popular libraries, highlighting its efficiency:

| Library         | .min.js  | .min.js.gz |
| --------------- | -------- | ---------- |
| **purify.js**   | 2.3 KB   | 1.0 KB     |
| Preact 10.19.3  | 11.2 KB  | 4.5 KB     |
| Solid 1.8.12    | 23 KB    | 8.1 KB     |
| jQuery 3.7.1    | 85.1 KB  | 29.7 KB    |
| Vue 3.4.15      | 110.4 KB | 40 KB      |
| ReactDOM 18.2.0 | 130.2 KB | 42 KB      |
| Angular 17.1.0  | 310 KB   | 104 KB     |

---

## Installation 🍙

[Install Instructions](https://github.com/DeepDoge/purify.js/releases)

## Guide 🍱

Sooner

## Documentation 🍱

Soon

## Example: purify.js + ShadowRoot

```ts
import { awaited, computed, css, fragment, ref, sheet, tags } from "purify-js"

const { div, button } = tags

const count = ref(0)
const double = computed(() => count.val * 2)

function App() {
    return div({ id: "app" }).children(Counter())
}

function Counter() {
    const host = div()
    const shadow = host.element.attachShadow({ mode: "open" })
    shadow.adoptedStyleSheets.push(counterStyle)

    shadow.append(
        fragment(
            button({ class: "my-button", hello: count })
                .onclick(() => count.val++)
                .children("Count:", count),
            ["Double:", double],
        ),
    )
    return host
}

const counterStyle = sheet(css`
    :host {
        display: grid;
        place-content: center;
    }

    .my-button {
        overflow-wrap: break-word;
    }
`)

document.adoptedStyleSheets.push(
    sheet(css`
        :root {
            color-scheme: dark;
        }
    `),
)

document.body.append(App().element)
```

## Example: Async Search

```ts
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

    return ul().children(...result.map((item) => li().children(item))).element
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
```

## Motivation 🍣

JavaScript frameworks are often large and complex. As your project grows, they can introduce obscure reactivity bugs and force you into their specific ecosystems, restricting your use of native browser APIs (Vanilla JavaScript). Many frameworks prevent direct DOM manipulation and struggle to keep up with new CSS features, resulting in poorly scoped CSS. Additionally, their reliance on custom file extensions and build steps can complicate the use of regular JavaScript or TypeScript files, leading to type-related issues.

**purify.js** aims to enhance the developer experience while keeping you as close to pure JavaScript as possible. Here’s how:

-   **Simple Reactivity**: By using signals, we maintain straightforward reactivity. Signals are easy to detect in the code using the `instanceof` keyword, and you have control over manually notifying signal followers with the `notify()` function. This eliminates the need to wrap unrelated logic inside functions like `update()`. Getters and setters further improve the developer experience, making it clear when you're working with a signal.

-   **Clear DOM Element Creation**: **purify.js** provides a simple and readable way to create DOM elements and templates with full type safety. It ensures a clear separation between element attributes and properties, so you always know what you’re setting.

-   **Minimal and Pure**: The library is minimal, focusing on providing signals and templating to enhance the developer experience. This approach reduces complexity and keeps your codebase closer to native JavaScript.

By keeping it pure, **purify.js** adds necessary functionality while avoiding the limitations and intricate bugs of modern JavaScript frameworks.

## Why Not JSX Templating?

-   **Lack of Type Safety**: JSX does not offer the same level of type safety, which decreases the developer experience. For instance, if you create a `<img>` element with JSX, it can't have the HTMLImageElement type, because all JSX elements has to return the same type.
-   **Build Step Required**: JSX requires a build step, adding complexity to the development workflow.

## What is Next and Caveats

-   **JSDoc Support**: Enhancing JSDoc support is necessary, as maintaining both .js and .d.ts files is cumbersome. Generating .d.ts files from JSDoc has its own set of issues. Future improvements may involve finding alternative solutions or waiting for more robust JSDoc support.
-   **Lifecycle and Reactivity**: Currently we abuse CustomElements to detect if an element is connected to the DOM or not, this makes us have to wrap our signals renders in a CustomElements with `display: contents` style. This is "fine", but causes issues in CSS for example doing `.parent > *` wouldn't actually select all of the "children", if some of them are signals. We have to do the same thing for attributes that are binded with the signals. This is not good. But but browser APIs doesn't let use do that easily while still letting user the manipulate the DOM how ever they want.
    Ideally we would wanna have something like this:

```ts
onConnected(mountable: CharacterData | Element, callback: () => Cleanup | void)
```

That's not possible currently, but i will explore options. And try to come up with something better with CustomElements.
You might say "Why not use `MutationObserver`?". Well, there are two reasons why, first of all, `MutationObserver` is asynchronous which causes problems wiht conditional UI rendering with signals. secondly they can't look inside ShadowDOMs without hacking around and modifying `HTMLElement.prototype.attachShadow`. Which is also not future-proof. The reasons why we don't want to wrap too much around the native browser api is also this, being future-proof.

Anway so I'm still exploring options in this area, major frameworks usually do this by not allowing developers to modify the DOM by themselves, we don't want that, and also some other smaller libraries do this with Garbage Collection, which doesn't allow, connecting and disconnecting element from the DOM multiple times. So yeah, I'm still exploring.

-   **Real-World Application and PWA Template**: I plan to build a project with **purify.js** to ensure it works well in a complex environment. This process will help identify any gaps and refine the library. Additionally, I aim to create a PWA template or package focused on enhancing the **purify.js** experience for building progressive web apps.

## testing to see if i add issue link the README, it shows up in the issue page, we dont want to

https://github.com/DeepDoge/discord-steam-proton-rpc/issues/4
