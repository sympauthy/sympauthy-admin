<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { Bars3Icon } from '@heroicons/vue/20/solid'
import SidebarNav from '@/components/layout/SidebarNav.vue'
import BreadcrumbNav from '@/components/layout/BreadcrumbNav.vue'
import { useSidebar } from '@/composables/useSidebar'

const { t } = useI18n()
const { sidebarOpen, toggleSidebar, closeSidebar } = useSidebar()
</script>

<template>
  <div class="flex h-screen">
    <!-- Backdrop (mobile/tablet only) -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="closeSidebar"
    />

    <!-- Sidebar -->
    <SidebarNav
      class="fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 lg:relative lg:translate-x-0"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    />

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-h-0 min-w-0">
      <!-- Mobile header -->
      <div class="h-14 shrink-0 flex items-center px-4 border-b border-gray-200 bg-white lg:hidden">
        <button :title="t('nav.openMenu')" @click="toggleSidebar">
          <Bars3Icon class="h-6 w-6 text-gray-600" />
        </button>
        <span class="ml-3 text-lg font-semibold text-gray-900">SympAuthy Admin</span>
      </div>
      <BreadcrumbNav />
      <main class="flex-1 overflow-y-auto p-4 lg:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
