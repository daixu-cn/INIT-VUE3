import { createRouter, createWebHistory } from "vue-router"
import { BASE_URL } from "@/global/env"
import routes from "@/router/routes"
import useTitle from "@/router/hooks/useTitle"
import useProgress from "@/router/hooks/useProgress"

const router = createRouter({
  history: createWebHistory(BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  useProgress()

  next()
})

router.afterEach(to => {
  useProgress(false)
  useTitle(to)
})

export default router
