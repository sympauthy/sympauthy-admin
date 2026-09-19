<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router'

export interface RecordTab {
  label: string
  to: RouteLocationRaw
}

/**
 * The views one record is read through, under its summary.
 *
 * Each tab is a route rather than a panel the strip shows and hides, so a view is addressable and
 * the one open survives a reload. `RouterLink` decides which is current, which is why nothing here
 * takes an active tab.
 */
defineProps<{
  tabs: RecordTab[]
}>()

// The two states name no utility in common. `active-class` would leave both sets on the element and
// let the stylesheet's order settle it, and Tailwind emits a custom-property colour before a named
// one — so `border-transparent` would win over the active border every time.
const tabClasses = 'whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium'
const activeTabClasses = 'border-(--color-primary) text-(--color-primary)'
const inactiveTabClasses =
  'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
</script>

<template>
  <nav class="flex shrink-0 gap-1 overflow-x-auto border-b border-gray-200">
    <RouterLink
      v-for="tab in tabs"
      :key="tab.label"
      v-slot="{ href, navigate, isActive }"
      :to="tab.to"
      custom
    >
      <a
        :href="href"
        :class="[tabClasses, isActive ? activeTabClasses : inactiveTabClasses]"
        :aria-current="isActive ? 'page' : undefined"
        @click="navigate"
      >
        {{ tab.label }}
      </a>
    </RouterLink>
  </nav>
</template>
