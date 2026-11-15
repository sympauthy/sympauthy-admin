<script lang="ts" setup>
import SidebarNav from './SidebarNav.vue'
import BreadcrumbNav from './BreadcrumbNav.vue'
import { useSidebar } from '@/shared/lib'
import { SaAppShell } from '@sympauthy/design'

const { sidebarOpen } = useSidebar()
</script>

<template>
  <SaAppShell v-model:sidebar-open="sidebarOpen">
    <template #sidebar>
      <SidebarNav />
    </template>
    <template #bar>
      <BreadcrumbNav />
    </template>
    <slot />
  </SaAppShell>
</template>
