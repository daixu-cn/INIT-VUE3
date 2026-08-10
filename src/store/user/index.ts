import { defineStore } from "pinia"

import type { State } from "./types"

const useUserStore = defineStore("user", {
  persist: { storage: sessionStorage },
  state: (): State => ({
    info: null,
    refreshToken: null,
    token: null,
    permission: [],
  }),
  actions: {
    setUser(info: Model.User.Data) {
      this.info = info
      localStorage.setItem("username", info.email)
    },
    setToken(token: string) {
      this.token = token
    },
    setSession(session: Model.Auth.Data) {
      this.info = session.user
      this.refreshToken = session.refreshToken
      this.token = session.accessToken
      localStorage.setItem("username", session.user.email)
    },
    setPermission(permission: string[]) {
      this.permission = permission
    },
    reset() {
      this.$reset()
    },
  },
})

export default useUserStore
