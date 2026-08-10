import type { RouteRecordRaw } from "vue-router"

import AdminRoutes from "@/router/routes/AdminRoutes"
import AuthRoutes from "@/router/routes/AuthRoutes"
import ErrorRoutes from "@/router/routes/ErrorRoutes"
import MainRoutes from "@/router/routes/MainRoutes"

const routes: Readonly<RouteRecordRaw[]> = [
  ...MainRoutes,
  ...AuthRoutes,
  ...AdminRoutes,
  ...ErrorRoutes,
]

export default routes
