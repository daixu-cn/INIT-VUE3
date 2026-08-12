import type { RouteRecordRaw } from "vue-router"

import AdminRoutes from "@/router/routes/AdminRoutes"
import AuthRoutes from "@/router/routes/AuthRoutes"
import MainRoutes from "@/router/routes/MainRoutes"

const routes: Readonly<RouteRecordRaw[]> = [...MainRoutes, ...AuthRoutes, ...AdminRoutes]

export default routes
