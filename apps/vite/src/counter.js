/**
 * @param {Element} element
 */
export function setupCounter(element) {
    let counter = 0
    /** @param {number} count */
    const setCounter = (count) => {
        counter = count
        element.innerHTML = `count is ${counter}`
    }
    element.addEventListener("click", () => setCounter(counter + 1))
    setCounter(0)
}
