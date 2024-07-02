import type { RouteRecordRaw } from "vue-router"

const AuthenticationRoutes: Readonly<RouteRecordRaw[]> = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Authentication/Login/Login.vue"),
    meta: {
      title: "登录"
    }
  },
  {
    path: "/signup",
    name: "Signup",
    component: () => import("@/views/Authentication/Signup/Signup.vue"),
    meta: {
      title: "注册"
    }
  }
]

export default AuthenticationRoutes
