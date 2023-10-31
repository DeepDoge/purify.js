<p align="center">
    <img width="240px" height="auto" src="https://ipfs.io/ipfs/QmRZXurxmTZwQC2GPrdNidPJ3PS4SrXSFqkeeoV24DXt4e" />
</p>
<p align="center">
    A lightweight TypeScript library designed for creating SPAs, that is complementary to the browser's
    native APIs. Small yet powerful. Simple yet still useful.
</p>

## Size ⚡

**min.js:** 5.72kb<br/>
**min.js.gz:** 2.83kb

## Todo Examples

### Todo 1

Todo example using fragments and CSS `@scoped`

```ts
import { $, fragment, signal } from "master-ts/core"
import { css, each } from "master-ts/extra"

const { div, label, input, textarea } = $

export function Todo1() {
    const todos = signal(
        new Set([
            { text: signal("Learn about Web Components"), completed: signal(true) },
            { text: signal("Learn about native JS APIs"), completed: signal(false) },
            { text: signal("Learn master-ts"), completed: signal(false) },
            { text: signal("Build an app"), completed: signal(false) }
        ])
    )

    return fragment(
        div({ class: "items" }, [
            each(() => Array.from(todos.ref))
                .key((todo) => todo)
                .as(
                    (todo) => () =>
                        label({ class: "item", "class:completed": todo.ref.completed }, [
                            input({ type: "checkbox", "bind:value": todo.ref.completed }),
                            textarea({ type: "text", "bind:value": todo.ref.text })
                        ])
                ),
            css`
                @scope {
                    :scope {
                        display: grid;
                        gap: 1em;
                    }

                    .item {
                        display: grid;
                        grid-template-columns: auto 1fr;
                        gap: 1em;
                    }

                    textarea {
                        resize: vertical;
                    }
                }
            `.toStyle()
        ])
    )
}
```

### Todo 2

Todo example using class based custom element with shadow DOM

```ts
import { $, signal } from "master-ts/core"
import { css, each } from "master-ts/extra"

const { div, label, input, textarea } = $

export class Todo2 extends HTMLElement {
    readonly shadowRoot = this.attachShadow({ mode: "open" })

    readonly #todos = signal(
        new Set([
            { text: signal("Learn about Web Components"), completed: signal(true) },
            { text: signal("Learn about native JS APIs"), completed: signal(false) },
            { text: signal("Learn master-ts"), completed: signal(false) },
            { text: signal("Build an app"), completed: signal(false) }
        ])
    )

    constructor() {
        super()
        this.shadowRoot.adoptedStyleSheets.push(Todo2.style)
        this.shadowRoot.append(
            div({ class: "items" }, [
                each(() => Array.from(this.#todos.ref))
                    .key((todo) => todo)
                    .as(
                        (todo) => () =>
                            label({ class: "item", "class:completed": todo.ref.completed }, [
                                input({ type: "checkbox", "bind:value": todo.ref.completed }),
                                textarea({ type: "text", "bind:value": todo.ref.text })
                            ])
                    )
            ])
        )
    }

    static style = css`
        .items {
            display: grid;
            gap: 1em;
        }

        .item {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 1em;
        }

        textarea {
            resize: vertical;
        }
    `.toSheet()
}
customElements.define("x-todo2", Todo2)
```

### Todo 3

Todo example using functional component with shadow DOM

```ts
import { $, populate, signal } from "master-ts/core"
import { css, defineCustomTag, each } from "master-ts/extra"

const { div, label, input, textarea } = $

const todo3Tag = defineCustomTag("x-todo3")
export function Todo3() {
    const host = todo3Tag()
    const dom = host.attachShadow({ mode: "open" })
    dom.adoptedStyleSheets.push(todo3Style)

    const todos = signal(
        new Set([
            { text: signal("Learn about Web Components"), completed: signal(true) },
            { text: signal("Learn about native JS APIs"), completed: signal(false) },
            { text: signal("Learn master-ts"), completed: signal(false) },
            { text: signal("Build an app"), completed: signal(false) }
        ])
    )

    populate(dom, [
        div({ class: "items" }, [
            each(() => Array.from(todos.ref))
                .key((todo) => todo)
                .as(
                    (todo) => () =>
                        label({ class: "item", "class:completed": todo.ref.completed }, [
                            input({ type: "checkbox", "bind:value": todo.ref.completed }),
                            textarea({ type: "text", "bind:value": todo.ref.text })
                        ])
                )
        ])
    ])

    return host
}

const todo3Style = css`
    .items {
        display: grid;
        gap: 1em;
    }

    .item {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 1em;
    }

    textarea {
        resize: vertical;
    }
`.toSheet()
```

## Installation 🍙

[Install Instructions](https://github.com/DeepDoge/master-ts/releases)

## Documentation 🍱

Work in progress

[Currently Available Unfinished Documentation](https://ipfs.io/ipfs/QmQCSG75nx3y8CyrTiBkP6d75BGZKAHQ6Ex4JgNNrBsmwL)

## Motivation 🍣

These days, frameworks are getting more and more complex. They are getting more and more opinionated, some are getting their own languages.
And most importantly, they are trying to do everything at once SSR, SSG, SPA, HMR, etc.

Meanwhile, native browser APIs are getting better and better, and **master-ts** is designed to be complementary to native browser APIs, not to replace them.

By only focusing on SPAs, **master-ts** is able work better with the browser's native APIs.
This also makes it easier to learn, and easier to use with other libraries and frameworks. If you know browser's native vanilla APIs and HTML, you already know **master-ts**

**master-ts** doesn't tell you how to build a component, how to mount a component, or what is a component. Because these things are not meant to be this complicated or opinionated. Define a function, create an `Element` or `Node`, throw it into the DOM any way you want, and you are done. Put a `signal` in it, and it will be reactive. Remove it from the DOM, append it back, again multiple times, and it will still work.

It gives you the freedom to build your app however you want:

-   Wanna use Shadow DOM? Go ahead.
-   Wanna use Custom Elements? Go ahead.
-   Wanna use fragments with CSS `@scoped`? Go ahead.
-   Wanna use history API? Go ahead.
-   Wanna use hash router? Go ahead.
-   Wanna make class based Components? Go ahead.
-   Wanna make functional Components? Go ahead.

Do whatever you want, in the way you want, and **master-ts** will work with you.<br/>
Because, **master-ts** is not a framework, it's just a library of helpful tools that helps you with templating and reactivity.
It's a complementent to native vanilla browser APIs.

## Philosophy 🍜

-   **Lightweight** - It's only 2.6kb minified and gzipped.
-   **Complementary** - It's designed to be complementary to the browser's native APIs, not to replace them.
-   **Minimal** - It's designed to be minimal, and only focus on SPAs.
-   **Simple** - It's designed to be simple, and easy to learn.
-   **Flexible** - It's designed to be flexible, and work with other libraries and frameworks.
-   **TypeScript** - It's designed to be used with TypeScript, and leverage the power of TypeScript, to reduce the runtime overhead.

## Why Consider Using **master-ts**? 🍡

### Q1: Is **master-ts** Easy to Learn? 🍥

**A1:** Yes, **master-ts** is designed to be simple and easy to learn. If you know browser's native APIs and HTML, you already have a head start. It doesn't introduce complex abstractions or its own new syntax.

### Q2: How Does **master-ts** Handle Compatibility? 🍢

**A2:** **master-ts** is compatible with various other libraries and frameworks. It doesn't impose its own conventions for mounting or unmounting elements, making it easy to integrate with other technologies.

### Q3: What About Library Size? 🍘

**A3:** **master-ts** is one of the smallest DOM libraries, making it a great choice for performance-conscious applications.

## Addressing Concerns 🍚

### Q4: Does **master-ts** Lock Developers In? 🧁

**A4:** No, **master-ts** doesn't create vendor lock-in. You can easily transition to other frameworks or libraries since it works well alongside them without hacks or tricks. Just make sure in only runs on CSR (Client Side Rendering).

### Q5: What About Built-in Features? 🍩

**A5:** **master-ts** intentionally focuses on being minimal. It doesn't include built-in features like routing to allow you to choose your preferred solutions. It provides reactivity and templates as its core features. And already covers wide variety of reactive features while staying fit and small.

## Vite Plugin 🍤

Vite plugin doesn't support the latest version of master-ts atm.

~~MasterTS is a UI building library. So you may wonder, why does a library have a "Vite" plugin? The truth is, you don't actually need this plugin for MasterTS to work. The plugin simply bakes your MasterTS code, including HTML templates, at build time to improve runtime performance.~~

~~So it's recommended that you use [MasterTS Vite Plugin](https://github.com/DeepDoge/master-ts-vite-plugin)~~
