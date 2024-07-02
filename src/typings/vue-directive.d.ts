import { ObjectDirective } from "vue"

declare module "@vue/runtime-core" {
  export interface ComponentCustomProperties {
    /**
     * 用户权限校验
     *
     * \<div v-permission:xxx> or \<div v-permission="'xxx'">
     */
    vPermission: ObjectDirective<HTMLElement, string>
  }
}
