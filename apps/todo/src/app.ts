import { css, each, effect$, populate, sheet, signal, tags } from "master-ts"
import { Hello } from "./hello"
import { Issue } from "./issue"

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

    populate(dom, {}, [
        Issue(),

        Hello(),

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
