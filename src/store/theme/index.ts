import { defineStore } from "pinia"
import { useDark } from "@vueuse/core"
import type { State } from "./types"

export default defineStore("theme", {
  state: (): State => ({
    dark: useDark()
  })
})()
