import { ref, tags } from "cherry-js"
import { setupCounter } from "./counter.js"
import javascriptLogo from "./javascript.svg"
import "./style.css"
import viteLogo from "/vite.svg"

const app = document.querySelector("#app")
if (!app) throw new Error("No #app element found")

app.innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Hello Vite!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>
  </div>
`

const counter = document.querySelector("#counter")
if (!counter) throw new Error("No #counter element found")
setupCounter(counter)

const { button, div } = tags

const count = ref(0)
const element = button({ "on:": (event) => count.val++, ariaBusy: "true" }, [
    "count is ",
    count,
])
document.body.append(element)

// A
div().render((myDiv) => [
    button()
        .onclick(() => (myDiv.style.background = "red"))
        .ariaBusy("true")
        .children(() => ["count is ", count]),
    button()
        .on("click", (event) => (myDiv.style.background = "red"))
        .ariaBusy("true")
        .set("")
        .render(() => ["count is ", count]),
])

input().type("text").build().valueAsNumber

// B
div({}, [
    button({ onclick: () => count.val++, ariaBusy: "true" }, ["count is ", count]),
    button({ onclick: () => count.val++, ariaBusy: "true" }, ["count is ", count]),
])

// Vanilla
const outerDiv = document.createElement("div")
const button1 = document.createElement("button")
button1.addEventListener("click", () => (outerDiv.style.background = "red"))
button1.ariaBusy = "true"
button1.append("count is ", 1)

const button2 = document.createElement("button")
button2.addEventListener("click", () => (outerDiv.style.background = "red"))
button2.ariaBusy = "true"
button2.append("count is ", 1)

outerDiv.append(button1, button2)

{
}
