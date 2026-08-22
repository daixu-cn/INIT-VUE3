import type { RouteRecordRaw } from "vue-router"

const AdminRoutes: Readonly<RouteRecordRaw[]> = [
  {
    path: "/admin",
    component: () => import("@/views/Admin/Layout.vue"),
    redirect: "/admin/reports",
    meta: { auth: true },
    children: [
      {
        path: "reports",
        name: "AdminReports",
        component: () => import("@/views/Admin/Reports.vue"),
        meta: { title: "举报处理 · Echo 管理后台", auth: true },
      },
      {
        path: "character-communities",
        name: "AdminCharacterCommunities",
        component: () => import("@/views/Admin/CharacterCommunities.vue"),
        meta: { title: "角色真人社区 · Echo 管理后台", auth: true },
      },
      {
        path: "billing",
        name: "AdminBilling",
        component: () => import("@/views/Admin/Billing.vue"),
        meta: { title: "退款与支付风控 · Echo 管理后台", auth: true },
      },
      {
        path: "feedback",
        name: "AdminFeedback",
        component: () => import("@/views/Admin/Feedback.vue"),
        meta: { title: "意见与反馈 · Echo 管理后台", auth: true },
      },
      {
        path: "discovery-facets",
        name: "AdminDiscoveryFacets",
        component: () => import("@/views/Admin/DiscoveryFacets.vue"),
        meta: { title: "发现分类 · Echo 管理后台", auth: true },
      },
      {
        path: "system-stickers",
        name: "AdminSystemStickers",
        component: () => import("@/views/Admin/SystemStickers.vue"),
        meta: { title: "系统表情 · Echo 管理后台", auth: true },
      },
      {
        path: "app-operations",
        name: "AdminAppOperations",
        component: () => import("@/views/Admin/AppOperations.vue"),
        meta: { title: "应用运维 · Echo 管理后台", auth: true },
      },
    ],
  },
]

export default AdminRoutes
