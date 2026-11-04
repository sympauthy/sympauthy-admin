<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import SidebarNav from './SidebarNav.vue'
import BreadcrumbNav from './BreadcrumbNav.vue'
import { useSidebar } from '@/shared/lib'
import { SaAppShell } from '@sympauthy/design'

const { t } = useI18n()
const { sidebarOpen } = useSidebar()
</script>

<template>
  <SaAppShell v-model:sidebar-open="sidebarOpen" :open-menu-label="t('nav.openMenu')">
    <template #sidebar>
      <SidebarNav />
    </template>
    <template #bar>
      <BreadcrumbNav />
    </template>
    <slot />
  </SaAppShell>
</template>
