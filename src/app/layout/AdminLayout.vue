<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { Bars3Icon } from '@heroicons/vue/20/solid'
import SidebarNav from './SidebarNav.vue'
import BreadcrumbNav from './BreadcrumbNav.vue'
import { useSidebar } from '@/shared/lib'
import { BrandLogo, BrandWordmark } from '@/shared/ui'

const { t } = useI18n()
const { sidebarOpen, toggleSidebar, closeSidebar } = useSidebar()
</script>

<template>
  <div class="flex h-screen">
    <!-- Backdrop (mobile/tablet only) -->
    <div v-if="sidebarOpen" class="fixed inset-0 z-40 bg-nav/50 lg:hidden" @click="closeSidebar" />

    <!-- Sidebar -->
    <SidebarNav
      class="fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 lg:relative lg:translate-x-0"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    />

    <!-- Main content -->
    <div class="flex min-h-0 min-w-0 flex-1 flex-col">
      <!-- Mobile header -->
      <div class="flex h-14 shrink-0 items-center border-b border-gray-200 bg-white px-4 lg:hidden">
        <button :title="t('nav.openMenu')" @click="toggleSidebar">
          <Bars3Icon class="size-6 text-gray-600" />
        </button>
        <BrandLogo class="ml-3" />
        <span class="ml-2 min-w-0 truncate text-lg font-semibold text-gray-900">
          <BrandWordmark /> {{ t('nav.panel') }}
        </span>
      </div>
      <!-- The breadcrumb and the page under it scroll in one box, and both centre their column
           in it. A vertical scrollbar narrows the box it belongs to and not its neighbour, so two
           boxes capped at the same width would centre half a scrollbar apart and the record's name
           would stop sitting over the record. The breadcrumb is pinned to the top of that box. -->
      <div class="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <BreadcrumbNav class="sticky top-0 z-20" />
        <!-- Sized by the box rather than by what it holds, so a collection filling the height
             scrolls its rows and not the page. -->
        <main class="mx-auto min-h-0 w-full max-w-page flex-1 p-4 lg:p-6">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>
