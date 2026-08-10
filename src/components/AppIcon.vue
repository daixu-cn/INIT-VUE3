<template>
  <svg aria-hidden="true" class="app-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path :d="path" fill="currentColor" />
  </svg>
</template>

<script setup lang="ts">
defineProps<{ path: string }>()
</script>

<style scoped>
.app-icon {
  display: block;
  width: 1em;
  height: 1em;
}
</style>
