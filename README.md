<h1 align="center"> purified.js </h1>

<p align="center">
    <img width="100px" height="auto" alt="purified.js logo" src="https://ipfs.io/ipfs/QmPmZkHS66TTFiVpRQiyM7FbDZ3sKzkQEtWVeXuRp8cs9V" />
</p>
<p align="center">
    Don't limit your potential
</p>

---

<p align="center">
    **purified.js** is a 1.0kB _(minified, gzipped)_ JavaScript UI building library that encourages the usage of pure JavaScript and DOM, while providing a thin layer of abstraction for the annoying parts for better DX _(developer experience)_.
</p>

---

## Compare

### Size ⚡

| Library         | .min.js | .min.js.gz |
| --------------- | ------- | ---------- |
| **purified.js** | 2.1kB   | 1.0kB      |
| Preact 10.19.3  | 11.2kB  | 4.5kB      |
| Solid 1.8.12    | 23kB    | 8.1kB      |
| jQuery 3.7.1    | 85.1kB  | 29.7kB     |
| Vue 3.4.15      | 110.4kB | 40kB       |
| ReactDOM 18.2.0 | 130.2kB | 42kB       |
| Angular 17.1.0  | 310kB   | 104kB      |

### Syntax

[Compare Syntax](https://bafybeib32e7wggz53xdzuhykevx5lquwny3lzsqm7entfe7zu7gnncn5o4.ipfs.dweb.link)


## Installation 🍙

To install **purified.js**, follow the [installation instructions](https://github.com/DeepDoge/purified.js/releases).

## Key Features 🍚

-   **purified.js** uses signals.
-   **purified.js** provides built-in signals and utilities such as:
    -   **`ref()`** state signal.
    -   **`computed()`** computed signal.
    -   **`awaited()`** converts a promise into a signal.
    -   **`effect()`** follows and reacts to multiple signals.
-   **purified.js** allows direct DOM manipulation, because it can.



## Examples

### purified.js + ShadowRoot 🍤

```ts
import { computed, css, fragment, ref, sheet, tags } from "purified-js"

const { div, button } = tags

function App() {
    return div({ id: "app" }).children(Counter())
}

function Counter() {
    const host = div()
    const shadow = host.element.attachShadow({ mode: "open" })

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

document.body.append(App().element)
```


## Guide 🥡

Coming soon.



## Current Limitations 🦀

-   **Lifecycle and Reactivity**: Currently, I use Custom Elements to detect if an element is connected to the DOM. This means:

    -   Every element created by the `tags` proxy, are Custom Elements. But they look like normal `<div>`(s) and `<span>`(s) and etc on the DevTools, because they extend the original element and use the original tag name. This way we can follow the life cycle of every element. And it works amazingly.
    -   But we also have signals, which might not return an HTMLElement. So we gotta wrap signals with something in the DOM. So we can follow its lifecycle and know where it starts and ends. Traditionally this is done via `Comment` `Node`(s). But there is no feasible and sync way to follow a `Comment` `Node` on the DOM while also allowing direct DOM manipulation ([DOM#533](https://github.com/whatwg/dom/issues/533)). So instead of `Comment` `Node`(s), I used Custom Elements to wrap signal renders. This way, I can follow the lifecycle of the signal render in the DOM, and decide to follow or unfollow the signal. Since signal render itself is an `Element` this approach has limitations, such as `.parent > *` selector wouldn't select all children if some are inside a signal.

        As another solution to this, a `HTMLElement` or `Element` attribute similar to `inert` that hides the element from the query selector both in JS and CSS would also be useful.

    But as long as the developer is aware of this limitation or difference, it shouldn't cause any issues.

## Why Not JSX Templating? 🍕

-   **Lack of Type Safety**: An `<img>` element created with JSX cannot have the `HTMLImageElement` type because all JSX elements must return the same type. This causes issues if you expect a `HTMLImageElement` some where in the code but all JSX returns is `HTMLElement` or something like `JSX.Element`. Also, it has some other issues related to the generics, discriminated unions and more.

-   **Build Step Required**: JSX necessitates a build step, adding complexity to the development workflow. In contrast, **purified.js** avoids this, enabling a simpler and more streamlined development process by working directly with native JavaScript and TypeScript.

-   **Attributes vs. Properties**: In **purified.js**, I can differentiate between attributes and properties of an element while building it, which is not currently possible with JSX. This distinction enhances clarity and control when defining element characteristics. Additionally, if I were to use JSX, I would prefer a syntax like this:

---
