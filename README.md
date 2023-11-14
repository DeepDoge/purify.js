<p align="center">
    <img width="240px" height="auto" src="https://ipfs.io/ipfs/QmRZXurxmTZwQC2GPrdNidPJ3PS4SrXSFqkeeoV24DXt4e" />
</p>
<p align="center">
    A lightweight TypeScript library designed for creating SPAs, that is complementary to the browser's
    native APIs. Small yet powerful. Simple yet still useful.
</p>

## Size ⚡

**master-ts** has a really small bundle size. Yet it still has everything you need to build a SPA.

**min.js:** 4.99kb<br/>
**min.js.gz:** 2.5kb

<p align="center">
    <img width="auto" height="auto" src="https://ipfs.io/ipfs/QmPm7WTZ92HPCmLkFwdbUd5CEJDTkEWGqYQftMjBPUiX7B" />
</p>

## Todo Example

Todo example with a functional component and CSS `@scoped`

```ts
import { css, each, effect$, populate, sheet, signal, tags } from "master-ts"

const { div, textarea, style, button } = tags

export function Todo() {
    const dom = div()

    type TodoItem = { text: string; completed: boolean }

    const todos = signal(
        new Set<TodoItem>([
            { text: "Learn about Web Components", completed: true },
            { text: "Learn about native JS APIs", completed: false },
            { text: "Learn master-ts", completed: false },
            { text: "Build an app", completed: false }
        ])
    )

    const newTodoText = signal("Buy Eggs")
    function addTodo() {
        todos.ref.add({ text: newTodoText.ref, completed: false })
        todos.ping()
        newTodoText.ref = ""
    }

    function removeTodo(todo: TodoItem) {
        todos.ref.delete(todo)
        todos.ping()
    }

    function toggleTodo(todo: TodoItem) {
        todo.completed = !todo.completed
        todos.ping()
    }

    effect$(dom, () => console.log("Effect: Todos changed", todos.ref))
    todos.follow$(dom, (todos) => console.log("Follow: Todos changed", todos))

    populate(dom, [
        div({ class: "add" }, [
            textarea({ "bind:value": newTodoText }), //
            button({ "on:click": addTodo }, ["Add Todo"])
        ]),

        div({ class: "items" }, [
            each(() => Array.from(todos.ref))
                .key((todo) => todo)
                .as((todo) =>
                    div({ class: "item" }, [
                        div({ class: "toggle", role: "button", "on:click": () => toggleTodo(todo.ref) }, [
                            div([() => (todo.ref.completed ? "✅" : "🔲")]),
                            div([() => todo.ref.text])
                        ]),
                        button({ "on:click": (e) => removeTodo(todo.ref) }, ["Remove"])
                    ])
                )
        ]),

        style([
            css`
                @scope {
                    :scope {
                        display: grid;
                        gap: 1em;
                        grid-template-columns: minmax(0, 25em);
                        justify-content: center;
                    }

                    .add {
                        display: grid;
                        gap: 1em;

                        & textarea {
                            resize: vertical;
                            min-height: 6ch;
                            font: inherit;
                            padding: 0.5em;
                        }
                    }

                    .items {
                        display: grid;
                        gap: 1em;
                    }

                    .item {
                        display: grid;
                        grid-template-columns: auto 1fr auto;
                        gap: 0.5em;

                        & .toggle {
                            cursor: pointer;
                            display: grid;
                            grid-template-columns: subgrid;
                            grid-column: span 2;
                        }
                    }
                }
            `
        ])
    ])

    return dom
}

document.adoptedStyleSheets.push(
    sheet(css`
        :root {
            font-family: sans-serif;
            font-size: 2rem;
        }

        *,
        *::before,
        *::after {
            box-sizing: border-box;
        }

        textarea,
        input,
        button,
        select,
        option,
        optgroup {
            font: inherit;
        }
    `)
)

document.body.append(Todo())
```

## Installation 🍙

[Install Instructions](https://github.com/DeepDoge/master-ts/releases)

## Documentation 🍱

Work in progress

**OUTDATED**

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

-   **Lightweight** - It has a really small [bundle size](#size-).
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
