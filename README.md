# cherry-ts

<p align="center">
    <img width="100px" height="auto" alt="cherry-ts logo" src="https://ipfs.io/ipfs/QmWtKLVqAg4Y4oFCeExpkua3SQzuBk4FaiPfNQefsU8dKA" />
</p>
<p align="center">
    A lightweight TypeScript library designed for creating SPAs. Cherry on top of vanilla JS.
</p>

## Size ⚡

**cherry-ts** has everything you need and feature complete, and yet it's still very small.

**min.js.gz:** 2.27kb<br/>
**min.js:** 4.54kb

<p align="center">
    <img width="auto" height="auto" alt="screenshot of minified code showing how small the library is" src="https://ipfs.io/ipfs/QmYkbaQKLuRjXJGM3omab2WjfgVfxtGWJRARTa4K4HbjDt" />
</p>

## Installation 🍙

[Install Instructions](https://github.com/DeepDoge/cherry-ts/releases)

## Documentation 🍱

Will be available once `0.1.0` or `0.2.0` releases. Everything is changing all the time atm, maintaining the documentation is hard this early.

## Todo Example

Todo example with a functional component and CSS `@scoped`

```ts
import { Tags, css, each, sheet, signal } from "cherry-ts"

const { div, input, form, style } = Tags

const randomId = () => Math.random().toString(36).substring(2)

export namespace Todo {
    export type Item = {
        id: string
        text: string
        done: boolean
    }
}

export function Todo(initial: Todo.Item[] = []) {
    const todos = signal(initial)

    const currentText = signal("")
    const todoForm = form({
        hidden: true,
        id: randomId(),
        "on:submit"(event) {
            event.preventDefault()
            todos.ref.push({
                id: randomId(),
                text: currentText.ref,
                done: false,
            })
            todos.ping()
            currentText.ref = ""
        },
    })

    return div([
        todoStyle.cloneNode(true),
        todoForm,
        input({
            type: "text",
            "attr:form": todoForm.id,
            placeholder: "Add todo",
            "bind:value": currentText,
        }),
        div({ className: "todos" }, [
            each(todos)
                .key((todo) => todo.id)
                .as((todo) =>
                    div({ className: "todo" }, [
                        todo.ref.text,
                        input({
                            type: "checkbox",
                            checked: () => todo.ref.done,
                            "on:change"(event) {
                                todo.ref.done = event.currentTarget.checked
                                todos.ping()
                            },
                        }),
                        () => (todo.ref.done ? "Done!" : null),
                    ]),
                ),
        ]),
    ])
}

const todoStyle = style([
    css`
        @scope {
            :scope {
                display: grid;
                gap: 1em;
                max-inline-size: 20em;
                margin-inline: auto;
            }
        }
    `,
])

document.adoptedStyleSheets.push(
    sheet(css`
        *,
        *::before,
        *::after {
            box-sizing: border-box;
        }
    `),
)

document.body.append(
    Todo([
        {
            id: "1",
            text: "Buy milk",
            done: false,
        },
        {
            id: "2",
            text: "Buy eggs",
            done: false,
        },
        {
            id: "3",
            text: "Buy bread",
            done: false,
        },
    ]),
)
```

## Motivation 🍣

Native browser APIs has been getting better, and **cherry-ts** is designed to be complementary to native browser APIs, not to replace them.

By only focusing on SPAs, **cherry-ts** is able work better with the browser's native APIs.
This also makes it easier to learn, and easier to use with other libraries and frameworks. If you know browser's native vanilla APIs and HTML, you already know **cherry-ts**

**cherry-ts** doesn't tell you how to build a component, how to mount a component, or what is a component. And most importantly, it doesn't break when you use browsers native APIs on your DOM because it works with them.

It gives you the freedom to build your app however you want:

-   Wanna use Shadow DOM? Go ahead.
-   Wanna use Custom Elements? Go ahead.
-   Wanna use fragments with CSS `@scoped`? Go ahead.
-   Wanna use history API? Go ahead.
-   Wanna use hash router? Go ahead.
-   Wanna make class based Components? Go ahead.
-   Wanna make functional Components? Go ahead.

Do whatever you want, in the way you want, and **cherry-ts** will work with you.<br/>
Because, **cherry-ts** is not a framework, it's just a library of helpful tools that helps you with templating and reactivity.

## Why not cherry-js?

`cherry-ts` is relays heavily on TypeScript's type system. It's not possible to use it safely without TypeScript. So it's named `cherry-ts` instead of `cherry-js`.
If types comes to JS with this new "types as comments" proposal, then I can call it `cherry-js` instead.
