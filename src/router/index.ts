import { createRouter, createWebHistory } from "vue-router"

import { BASE_URL } from "@/global/env"
import routes from "@/router/routes"
import useStore from "@/store"
import { setProgress, setTitle } from "@/tools/router"

const router = createRouter({
  history: createWebHistory(BASE_URL),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, behavior: "smooth" }
    return { top: 0, left: 0, behavior: "smooth" }
  },
})

router.beforeEach(to => {
  setProgress()

  const { user } = useStore()
  if (user.token === "demo-admin") user.reset()
  if (to.meta.auth && (!user.token || user.info?.role !== "ADMIN")) {
    return { name: "AdminLogin", query: { redirect: to.fullPath } }
  }

  if (to.name === "AdminLogin" && user.token && user.info?.role === "ADMIN") {
    return { name: "AdminReports" }
  }

  return true
})

router.afterEach(to => {
  setProgress(false)
  setTitle(to)
})

export default router
