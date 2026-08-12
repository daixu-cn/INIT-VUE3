import type { RouteRecordRaw } from "vue-router"

const MainRoutes: Readonly<RouteRecordRaw[]> = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/Main/Home/Home.vue"),
    meta: { title: "Echo 在每一次回应里 更懂彼此" },
  },
  {
    path: "/terms",
    name: "Terms",
    component: () => import("@/views/Main/Legal/Terms.vue"),
    meta: { title: "服务条款 · Echo" },
  },
  {
    path: "/privacy",
    name: "Privacy",
    component: () => import("@/views/Main/Legal/Privacy.vue"),
    meta: { title: "隐私政策 · Echo" },
  },
]

export default MainRoutes
