import type { RouteRecordRaw } from "vue-router"

const MainRoutes: Readonly<RouteRecordRaw[]> = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/Main/Home/Home.vue"),
    meta: { title: "Echo 在每一次回应里 更懂彼此" },
  },
]

export default MainRoutes
