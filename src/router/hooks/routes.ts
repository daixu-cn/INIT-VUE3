import routes from "@/router/routes"

// 获取所有 keep-alive: true 的路由名称
export function getKeepAliveNames() {
  return routes
    .flat(Infinity)
    .filter(route => route.meta?.["keep-alive"])
    .map(route => route.name as string)
}
