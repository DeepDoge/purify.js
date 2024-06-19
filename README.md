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
| **purify.js**   | 2.2 KB   | 1.0 KB     |
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

[Play on JSFiddle](https://jsfiddle.net/nomadshiba/p5t8o0zL/6/)

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

## What is Next and Caveats

-   **JSDoc Support**: Enhancing JSDoc support is crucial for better developer experience. Maintaining both `.js` and `.d.ts` files is cumbersome, and generating `.d.ts` files from JSDoc has its challenges. I aim to explore alternative solutions or wait for more robust JSDoc support.

    Relevant issues: [TypeScript#33136](https://github.com/microsoft/TypeScript/issues/33136), [TypeScript#46369](https://github.com/microsoft/TypeScript/issues/46369).

-   **Lifecycle and Reactivity**: Currently, I use Custom Elements to detect if an element is connected to the DOM, wrapping signal renders in Custom Elements with `display: contents` style. This approach has CSS limitations, such as `.parent > *` not selecting all children if some are signals. Similar workarounds are needed for attributes bound with signals.

    Ideally, I would like an API like:

    ```ts
    onConnected(mountable: CharacterData | Element, callback: () => Cleanup | void)
    ```

    This is currently not feasible ([DOM#533](https://github.com/whatwg/dom/issues/533)), but I will explore other options, including enhancing Custom Elements. MutationObserver is not ideal due to its asynchronous nature and limitations with ShadowDOMs, which would require modifying `HTMLElement.prototype.attachShadow`. Most frameworks avoid allowing developers to directly manipulate the DOM, but I aim to maintain flexibility while seeking future-proof solutions.

-   **Real-World Application and PWA Template**: I plan to build a project using **purify.js** to test its robustness in a complex environment. This will help identify any gaps and refine the library. Additionally, I aim to create a PWA template or package to enhance the **purify.js** experience for building progressive web apps.

## Why Not JSX Templating?

-   **Lack of Type Safety**: JSX does not provide the same level of type safety as **purify.js**. For example, creating an `<img>` element with JSX cannot have the `HTMLImageElement` type because all JSX elements must return the same type. This reduces the developer experience and increases the risk of type-related issues.

-   **Build Step Required**: JSX necessitates a build step, adding complexity to the development workflow. In contrast, **purify.js** avoids this, enabling a simpler and more streamlined development process by working directly with native JavaScript and TypeScript.

-   **Attributes vs. Properties**: In **purify.js**, I can differentiate between attributes and properties of an element while building it, which is not currently possible with JSX. This distinction enhances clarity and control when defining element characteristics. Additionally, if I were to use JSX, I would prefer a syntax like this:

    ```js
    <MyComponent("Hello", { World: "!" }) class="my-component" aria-busy="true" />
    ```

This format clearly separates props and attributes, making it easier to understand and maintain.
