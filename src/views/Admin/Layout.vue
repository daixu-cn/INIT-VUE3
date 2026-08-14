<template>
  <div class="admin-shell" :class="{ 'admin-shell--open': menuOpen }">
    <aside class="admin-sidebar">
      <div class="admin-brand">
        <img :src="BRAND_WORDMARK_URL" alt="Echo" />
        <span>管理后台</span>
      </div>

      <nav aria-label="管理员菜单">
        <RouterLink to="/admin/reports" @click="menuOpen = false">
          <AppIcon :path="mdiAlertOctagonOutline" />
          <span>举报处理</span>
        </RouterLink>
        <RouterLink to="/admin/feedback" @click="menuOpen = false">
          <AppIcon :path="mdiMessageTextOutline" />
          <span>意见与反馈</span>
        </RouterLink>
        <RouterLink to="/admin/app-operations" @click="menuOpen = false">
          <AppIcon :path="mdiCogOutline" />
          <span>应用运维</span>
        </RouterLink>
      </nav>
    </aside>

    <header class="admin-topbar">
      <button class="menu-toggle" type="button" aria-label="切换菜单" @click="menuOpen = !menuOpen">
        <AppIcon :path="menuOpen ? mdiClose : mdiMenu" />
      </button>
      <strong>Echo 管理后台</strong>
      <div class="admin-actions">
        <span>{{ user.info?.email }}</span>
        <RouterLink to="/">返回官网</RouterLink>
        <button type="button" @click="handleLogout">退出登录</button>
      </div>
    </header>

    <main class="admin-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  mdiAlertOctagonOutline,
  mdiClose,
  mdiCogOutline,
  mdiMenu,
  mdiMessageTextOutline,
} from "@mdi/js"
import { ref } from "vue"
import { useRouter } from "vue-router"

import AppIcon from "@/components/AppIcon.vue"
import { BRAND_WORDMARK_URL } from "@/global/env"
import { logout } from "@/server/api/auth"
import useStore from "@/store"

const router = useRouter()
const { user } = useStore()
const menuOpen = ref(false)

async function handleLogout() {
  await logout().catch(() => undefined)
  user.reset()
  router.replace({ name: "AdminLogin" })
}
</script>

<style scoped>
.admin-shell {
  --sidebar-width: 210px;
  min-height: 100svh;
  padding: 58px 0 0 var(--sidebar-width);
  background: #f5f7f8;
  color: #293334;
}

.admin-sidebar {
  position: fixed;
  z-index: 20;
  inset: 0 auto 0 0;
  width: var(--sidebar-width);
  padding: 0 14px;
  border-right: 1px solid #e1e6e8;
  background: #fff;
}

.admin-brand {
  display: flex;
  align-items: center;
  height: 58px;
  gap: 12px;
  padding: 0 10px;
  border-bottom: 1px solid #eef1f2;
}

.admin-brand img {
  width: 72px;
}

.admin-brand span {
  color: #7f898b;
  font-size: 12px;
}

.admin-sidebar nav {
  margin-top: 16px;
}

.admin-sidebar nav a {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 5px;
  color: #536063;
  font-size: 14px;
  text-decoration: none;
}

.admin-sidebar nav a.router-link-active {
  background: var(--color-admin-accent);
  color: #fff;
}

.admin-sidebar nav .app-icon {
  font-size: 18px;
}

.admin-topbar {
  position: fixed;
  z-index: 15;
  inset: 0 0 auto var(--sidebar-width);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 58px;
  padding: 0 20px;
  border-bottom: 1px solid #e1e6e8;
  background: #fff;
}

.admin-topbar > strong {
  color: var(--color-admin-accent);
  font-size: 16px;
}

.admin-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #7c8688;
  font-size: 12px;
}

.admin-actions a,
.admin-actions button {
  padding: 0;
  border: 0;
  background: transparent;
  color: #687477;
  cursor: pointer;
  font: inherit;
  text-decoration: none;
}

.admin-actions a:hover,
.admin-actions button:hover {
  color: var(--color-admin-accent);
}

.menu-toggle {
  display: none;
}

.admin-content {
  min-height: calc(100svh - 58px);
}

@media (max-width: 760px) {
  .admin-shell {
    padding-left: 0;
  }

  .admin-sidebar {
    width: min(250px, 82vw);
    transform: translateX(-101%);
    transition: transform 220ms ease;
  }

  .admin-shell--open .admin-sidebar {
    transform: translateX(0);
  }

  .admin-topbar {
    left: 0;
  }

  .menu-toggle {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border: 1px solid #d8dfe1;
    border-radius: 4px;
    background: #fff;
    color: var(--color-admin-accent);
  }

  .admin-topbar > strong,
  .admin-actions > span {
    display: none;
  }
}
</style>
