import { PermissionLevel } from "@/router/types/permission"
import type { Permission } from "@/router/types/permission"
import { Icon } from "vue-iconify"

const HomePermissions: Permission[] = [
  {
    path: "/home",
    label: "首页",
    icon: <Icon href="icon-logo" />,
    level: PermissionLevel.MENU
  }
]

export default HomePermissions
