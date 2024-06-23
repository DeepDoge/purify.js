# purify.js

<p align="center">
    <img width="100px" height="auto" alt="purify.js logo" src="#" />
</p>
<p align="center">
    Purify JavaScript Apps
</p>

## What is purify.js

**purify.js** is a 1.0KB _(minified, gzipped)_ JavaScript UI building library that encourages the usage of pure JavaScript and DOM, while providing a thin layer of abstraction for the annoying parts for better DX _(developer experience)_.

---

## Size ⚡

**purify.js** stands out with its minimal size:

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

To install **purify.js**, follow the [installation instructions](https://github.com/DeepDoge/purify.js/releases).

## Key Features 🍚

-   **purify.js** uses signals.
-   **purify.js** provides built-in signals and utilities such as:
    -   **`ref()`** state signal.
    -   **`computed()`** computed signal.
    -   **`awaited()`** converts a promise into a signal.
    -   **`effect()`** follows and reacts to multiple signals.
-   **purify.js** allows direct DOM manipulation, because it can.
-   **purify.js** is small because it's pure and simple.
-   **purify.js** is simple because it's small and pure.

---

## Example: purify.js + ShadowRoot 🍤

```ts
import { computed, css, fragment, ref, sheet, tags } from "purify-js"

const { div, button } = tags

function App() {
    return div({ id: "app" }).children(Counter())
}

function Counter() {
    const host = div()
    const shadow = host.element.attachShadow({ mode: "open" })
    shadow.adoptedStyleSheets.push(counterStyle)

    const count = ref(0)
    const double = computed(() => count.val * 2)

    shadow.append(
        fragment(
            button({ class: "my-button", "data-count": count })
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

[Play on JSFiddle](https://jsfiddle.net/nomadshiba/p5t8o0zL/12/)

---

## Guide 🥡

Coming soon.

## Documentation 🍱

Coming soon.

---

## Motivation 🍣

JavaScript frameworks are often large and complex, force you into their specific ecosystems, restrict your use of native browser APIs, and prevent direct DOM manipulation. Additionally, their reliance on custom file extensions and build steps can complicate the use of regular JavaScript or TypeScript files, leading to type-related issues.

**purify.js** aims to enhance the developer experience while keeping you as close to pure JavaScript as possible. By keeping it pure, **purify.js** adds necessary functionality while avoiding the limitations and intricate bugs of modern JavaScript frameworks.

---

## Current Limitations 🦀

-   **Lifecycle and Reactivity**: Currently, I use Custom Elements to detect if an element is connected to the DOM. This means:
    -   Every element created by the `tags` proxy, are Custom Elements. But they look like normal `<div>`(s) and `<span>`(s) and etc on the DevTools, because they extend the original element and use the original tag name. This way we can follow the life cycle of every element. And it works amazingly.
    -   But we also have signals, which might not return an HTMLElement. So we gotta wrap signals with something in the DOM. So we can follow its lifecycle and know where it starts and ends. Traditionally this is done via `Comment` `Node`(s). But there is no feasible and sync way to follow a `Comment` `Node` on the DOM while also allowing direct DOM manipulation ([DOM#533](https://github.com/whatwg/dom/issues/533)). So instead of `Comment` `Node`(s), I used Custom Elements to wrap signal renders. This way, I can follow the lifecycle of the signal render in the DOM, and decide to follow or unfollow the signal. Since signal render itself is an `Element` this approach has limitations, such as `.parent > *` selector wouldn't select all children if some are inside a signal.

---

## Why Not JSX Templating? 🍕

-   **Lack of Type Safety**: An `<img>` created element with JSX cannot have the `HTMLImageElement` type because all JSX elements must return the same type. This causes issues if you expect a `HTMLImageElement` some where in the code but all JSX returns is `HTMLElement` or something like `JSX.Element`.

-   **Build Step Required**: JSX necessitates a build step, adding complexity to the development workflow. In contrast, **purify.js** avoids this, enabling a simpler and more streamlined development process by working directly with native JavaScript and TypeScript.

-   **Attributes vs. Properties**: In **purify.js**, I can differentiate between attributes and properties of an element while building it, which is not currently possible with JSX. This distinction enhances clarity and control when defining element characteristics. Additionally, if I were to use JSX, I would prefer a syntax like this:

    ```js
    <MyComponent("Hello", { World: "!" }) class="my-component" aria-busy="true" />
    ```

    This format clearly separates props and attributes, making it easier to understand and maintain.
