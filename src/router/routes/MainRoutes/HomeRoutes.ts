import type { RouteRecordRaw } from "vue-router"

const HomeRoutes: Readonly<RouteRecordRaw[]> = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/Home/Home.vue"),
    meta: {
      title: "首页"
    }
  }
]

export default HomeRoutes
