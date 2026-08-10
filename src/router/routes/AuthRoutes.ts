import type { RouteRecordRaw } from "vue-router"

const AuthRoutes: Readonly<RouteRecordRaw[]> = [
  {
    path: "/admin/login",
    name: "AdminLogin",
    component: () => import("@/views/Admin/Login.vue"),
    meta: { title: "管理员登录 · Echo" },
  },
]

export default AuthRoutes
