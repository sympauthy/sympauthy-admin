<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import SidebarNav from './SidebarNav.vue'
import BreadcrumbNav from './BreadcrumbNav.vue'
import { useSidebar } from '@/shared/lib'
import { BrandWordmark, SaAppShell, SaBrandLogo } from '@/shared/ui'

const { t } = useI18n()
const { sidebarOpen } = useSidebar()
</script>

<template>
  <SaAppShell v-model:sidebar-open="sidebarOpen" :open-menu-label="t('nav.openMenu')">
    <template #sidebar>
      <SidebarNav />
    </template>
    <template #title>
      <SaBrandLogo />
      <span class="min-w-0 truncate"><BrandWordmark /> {{ t('nav.panel') }}</span>
    </template>
    <template #bar>
      <BreadcrumbNav />
    </template>
    <slot />
  </SaAppShell>
</template>
