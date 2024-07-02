import app from "@/global/app"
import { hasPermission } from "@/hooks/permission"

app.directive<HTMLElement, string>("permission", {
  mounted(el, { arg, value }) {
    const permissionName = value ?? arg

    if (!permissionName) return
    if (!hasPermission(permissionName)) el.remove()
  }
})
