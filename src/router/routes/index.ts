import type { RouteRecordRaw } from "vue-router"
import AuthenticationRoutes from "@/router/routes/AuthenticationRoutes"
import MainRoutes from "@/router/routes/MainRoutes"
import ErrorRoutes from "@/router/routes/ErrorRoutes"

const routes: Readonly<RouteRecordRaw[]> = [
  ...AuthenticationRoutes,
  ...MainRoutes,
  ...ErrorRoutes
]

export default routes
