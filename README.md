<p align="center">
    <img width="240px" height="auto" src="https://ipfs.io/ipfs/QmRZXurxmTZwQC2GPrdNidPJ3PS4SrXSFqkeeoV24DXt4e" />
</p>
<p align="center">
    A lightweight TypeScript library designed for creating SPAs, that is complementary to the browser's
    native APIs. Small yet powerful. Simple yet still useful.
</p>

## Size ⚡

**master-ts** has a really small bundle size. Yet it still has everything you need and more to build a SPA.

**min.js.gz:** 2.38kb<br/>
**min.js:** 4.7kb

<p align="center">
    <img width="auto" height="auto" src="https://ipfs.io/ipfs/QmYkbaQKLuRjXJGM3omab2WjfgVfxtGWJRARTa4K4HbjDt" />
</p>

#### All of this gives you:

-   **Signals, signal derivations, effects:**
-   -   `signal()`: Create a signal.
-   -   `derive()`: Create a derived signal from a function, and optionally a list of static dependencies. Also uses a `WeakMap` to memoize the function's result. So you get the same signal instance for the same function when no static dependencies are provided.
-   Signals only update when they have a listener.
-   **Built-in signals:**
-   -   `match()`: Pattern match on a signal to another value.
-   -   `each()`: Map a signal with a key.
-   -   `defer()`: Defer a signal update.
-   -   `awaited()`: Return a placeholder value while awating a promise or signal of a promise.
-   -   and more...
-   **Built-in signal utilities:**
-   -   `isSignal()`: Check if a value is a signal.
-   -   `signalFrom()`: Gets a `Signal` or `Function`. If it's a `Function`, it converts it into a derived `Signal`. And if it's a `Signal`, it returns it.
-   -   and many more...
-   **DOM templating:**
-   -   `tags`: Build templates easily using the `tags`, `Proxy`.
-   -   `customTag()`: Create a simple custom tag with custom element API.
-   -   Render any `Element`, `Node`, primative value and their recursive `Array`(s) or `Signal`(s) into the DOM.
-   -   Bind signals to attributes, input values, and more...
-   -   Add event listeners to elements.
-   -   `populate()`: Populate already created DOM `Node`(s) or `Element`(s) with attributes, children, bindings, events, and more...
-   -   Careful and efficient DOM updates with the minimal DOM changes, even when a signal of an `Array` changes.
-   **More:**
-   -   With `follow$()` and `effect$()`, bind your signal listener a DOM `Node`, to avoid manual cleanup.
-   -   With `onConnected$()` listen lifecycle of any DOM `Node` including comments, text nodes, and more...
-   -   CSS template literals to write CSS strings with IDE highlighting.
-   -   With `sheet()` convert any CSS string into a `CSSStyleSheet` that can be used with `adoptedStyleSheet`(s).

...and many more.

## Installation 🍙

[Install Instructions](https://github.com/DeepDoge/master-ts/releases)

## Documentation 🍱

Work in progress

**OUTDATED**

[Currently Available Unfinished Documentation](https://ipfs.io/ipfs/QmQCSG75nx3y8CyrTiBkP6d75BGZKAHQ6Ex4JgNNrBsmwL)

## Motivation 🍣

Nntive browser APIs has been getting better, and **master-ts** is designed to be complementary to native browser APIs, not to replace them.

By only focusing on SPAs, **master-ts** is able work better with the browser's native APIs.
This also makes it easier to learn, and easier to use with other libraries and frameworks. If you know browser's native vanilla APIs and HTML, you already know **master-ts**

**master-ts** doesn't tell you how to build a component, how to mount a component, or what is a component. And most importantly, it doesn't break when you use browsers native APIs on your DOM because it works with them.

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
            { text: "Build an app", completed: false },
        ]),
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
            textarea({ "bind:value": newTodoText }),
            button({ "on:click": addTodo }, ["Add Todo"]),
        ]),

        div({ class: "items" }, [
            each(() => Array.from(todos.ref))
                .key((todo) => todo)
                .as((todo) =>
                    div({ class: "item" }, [
                        div(
                            {
                                class: "toggle",
                                role: "button",
                                "on:click": () => toggleTodo(todo.ref),
                            },
                            [
                                div([() => (todo.ref.completed ? "✅" : "🔲")]),
                                div([() => todo.ref.text]),
                            ],
                        ),
                        button({ "on:click": (e) => removeTodo(todo.ref) }, ["Remove"]),
                    ]),
                ),
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
            `,
        ]),
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
    `),
)

document.body.append(Todo())
```
