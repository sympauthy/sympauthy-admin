<script lang='ts' setup>
import SidebarNav from '@/components/layout/SidebarNav.vue'
import BreadcrumbNav from '@/components/layout/BreadcrumbNav.vue'
</script>

<template>
  <div class='flex h-screen'>
    <SidebarNav />
    <div class='flex-1 flex flex-col min-h-0'>
      <BreadcrumbNav />
      <main class='flex-1 overflow-y-auto p-6'>
        <slot />
      </main>
    </div>
  </div>
</template>
