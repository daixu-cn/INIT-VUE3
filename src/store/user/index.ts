import { defineStore } from "pinia"

import type { State } from "./types"

const useUserStore = defineStore("user", {
  persist: { storage: sessionStorage },
  state: (): State => ({
    info: null,
    refreshToken: null,
    token: null,
  }),
  actions: {
    setSession(session: Model.Auth.Data) {
      this.info = session.user
      this.refreshToken = session.refreshToken
      this.token = session.accessToken
      localStorage.setItem("username", session.user.email)
    },
    reset() {
      this.$reset()
    },
  },
})

export default useUserStore
