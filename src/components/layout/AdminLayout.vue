<script lang='ts' setup>
import SidebarNav from '@/components/layout/SidebarNav.vue'
</script>

<template>
  <div class='flex min-h-screen'>
    <SidebarNav />
    <main class='flex-1 p-6 overflow-y-auto'>
      <slot />
    </main>
  </div>
</template>
