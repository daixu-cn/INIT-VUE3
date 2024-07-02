import type { RouteRecordRaw } from "vue-router"

const ErrorRoutes: Readonly<RouteRecordRaw[]> = [
  {
    path: "/:catchAll(.*)",
    name: "NotFound",
    component: () => import("@/views/Error/NotFound.vue"),
    meta: {
      title: "404"
    }
  }
]

export default ErrorRoutes
