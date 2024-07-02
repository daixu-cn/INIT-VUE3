import type { Permission } from "@/router/types/permission"
import HomePermissions from "@/router/permissions/HomePermissions"

const permissions: Permission[] = [...HomePermissions]

export default permissions
