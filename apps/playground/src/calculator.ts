import { css, signal, tags } from "cherry-ts"

const { div, input, button, style } = tags

export function Calculator() {
    const value = signal("")
    const sanitizedValue = () =>
        value.ref.split("").filter(allowed.has.bind(allowed)).join("")
    const result = () => String(eval(sanitizedValue()))

    const allowed = new Set("0123456789+-*/().")

    function isNumber(value: string) {
        return !isNaN(Number(value))
    }

    return div([
        input({ type: "text", "bind:value": value }),
        div({ class: "result" }, [() => (isNumber(result()) ? result() : "")]),

        div({ class: "buttons" }, [
            button({ "on:click": () => (value.ref = ""), "style:grid-area": "clear" }, [
                "Clear",
            ]),
            button({ "on:click": () => (value.ref += "1"), "style:grid-area": "one" }, [
                "1",
            ]),
            button({ "on:click": () => (value.ref += "2"), "style:grid-area": "two" }, [
                "2",
            ]),
            button({ "on:click": () => (value.ref += "3"), "style:grid-area": "three" }, [
                "3",
            ]),
            button({ "on:click": () => (value.ref += "4"), "style:grid-area": "four" }, [
                "4",
            ]),
            button({ "on:click": () => (value.ref += "5"), "style:grid-area": "five" }, [
                "5",
            ]),
            button({ "on:click": () => (value.ref += "6"), "style:grid-area": "six" }, [
                "6",
            ]),
            button({ "on:click": () => (value.ref += "7"), "style:grid-area": "seven" }, [
                "7",
            ]),
            button({ "on:click": () => (value.ref += "8"), "style:grid-area": "eight" }, [
                "8",
            ]),
            button({ "on:click": () => (value.ref += "9"), "style:grid-area": "nine" }, [
                "9",
            ]),
            button({ "on:click": () => (value.ref += "0"), "style:grid-area": "zero" }, [
                "0",
            ]),
            button({ "on:click": () => (value.ref += "+"), "style:grid-area": "add" }, [
                "+",
            ]),
            button(
                { "on:click": () => (value.ref += "-"), "style:grid-area": "subtract" },
                ["-"],
            ),
            button(
                { "on:click": () => (value.ref += "*"), "style:grid-area": "multiply" },
                ["*"],
            ),
            button(
                { "on:click": () => (value.ref += "/"), "style:grid-area": "divide" },
                ["/"],
            ),
            button(
                { "on:click": () => (value.ref += "."), "style:grid-area": "decimal" },
                ["."],
            ),
            button({ "on:click": () => (value.ref += "("), "style:grid-area": "open" }, [
                "(",
            ]),
            button({ "on:click": () => (value.ref += ")"), "style:grid-area": "close" }, [
                ")",
            ]),
        ]),

        style([
            css`
                @scope {
                    :scope {
                        display: grid;
                        grid-template-columns: minmax(0, 10em);
                        place-content: center;

                        gap: 0.5em;

                        font-family: sans-serif;
                        font-size: 2rem;
                    }

                    input,
                    button {
                        all: unset;
                        display: grid;
                        font: inherit;
                    }

                    input {
                        text-align: right;
                        background-color: hsl(210, 100%, 50%);
                        color: white;
                        padding: 0.25em 0.5em;
                        border-radius: 0.25em;
                    }

                    button {
                        place-items: center;
                        background-color: hsl(210, 100%, 50%);
                        color: white;
                        border-radius: 0.25em;
                        &:hover {
                            background-color: hsl(210, 100%, 40%);
                        }
                    }

                    .result {
                        &:not(:empty)::before {
                            content: "= ";
                        }
                        font-size: 0.5em;
                        opacity: 0.75;
                        height: 1.5ch;
                        justify-self: end;
                    }

                    .buttons {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        grid-template-rows: repeat(5, 1fr);
                        gap: 0.5em;

                        grid-template-areas:
                            "clear  clear   open    close"
                            "seven  eight   nine    divide"
                            "four   five    six     multiply"
                            "one    two     three   subtract"
                            "zero   zero    decimal add";
                    }
                }
            `,
        ]),
    ])
}
