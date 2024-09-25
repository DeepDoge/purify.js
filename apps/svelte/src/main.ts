import { onDestroy, onMount } from "svelte"
import { derived, get, readable, readonly, writable } from "svelte/store"
import App from "./App.svelte"
console.log(onMount, onDestroy, derived, get, readable, readonly, writable, App)
