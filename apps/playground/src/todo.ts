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
                done: true,
            })
            todos.ping()
            currentText.ref = ""
        },
    })

    return div([
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
                    ]),
                ),
        ]),
        style([
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
        ]),
    ])
}

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
