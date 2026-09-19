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
</script>

<template>
  <nav class="flex shrink-0 gap-1 overflow-x-auto border-b border-gray-200">
    <RouterLink
      v-for="tab in tabs"
      :key="tab.label"
      :to="tab.to"
      class="whitespace-nowrap border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
      active-class="border-(--color-primary) text-(--color-primary) hover:border-(--color-primary)"
    >
      {{ tab.label }}
    </RouterLink>
  </nav>
</template>
