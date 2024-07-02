import { user } from "@/store"

/**
 * 判断当前用户是否拥有查询的权限
 * @param permission 权限名称
 * @returns boolean
 */
export function hasPermission(permission: string) {
  return user.permission.includes(permission)
}
