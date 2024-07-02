<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <keep-alive :include="getKeepAliveNames()">
        <component :is="Component" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import { getKeepAliveNames } from "@/router/hooks/routes"
</script>

<style lang="scss">
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s;
}
</style>
