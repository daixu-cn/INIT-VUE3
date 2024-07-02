import { defineStore } from "pinia"
import type { Info, State } from "./types"

export default defineStore("user", {
  persist: true,
  state: (): State => ({
    info: null,
    token: null,
    permission: []
  }),
  actions: {
    setUser(info: Info) {
      this.info = info
    },
    setToken(token: string) {
      this.token = token
    },
    setPermission(permission: string[]) {
      this.permission = permission
    },
    reset() {
      this.$reset()
      sessionStorage.removeItem("token")
    }
  }
})()
