<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router'
import DocHelpTooltip from './DocHelpTooltip.vue'

export interface RecordTab {
  label: string
  to: RouteLocationRaw
  /** The key the view's `help` triple nests under, which `DocHelpTooltip` reads it from. */
  help?: string
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
const activeTabClasses = 'border-primary text-primary'
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
      <!-- The tab names its view, so its explanation belongs beside that name, on every tab rather
           than only the open one: a tab an operator has not opened is the one they are most likely
           to want explained. It is drawn outside the link, or opening it would navigate, and the
           underline is on the row around the two so that it spans both. -->
      <div
        class="flex shrink-0 items-center border-b-2 px-4 whitespace-nowrap"
        :class="isActive ? activeTabClasses : inactiveTabClasses"
      >
        <a
          :href="href"
          :aria-current="isActive ? 'page' : undefined"
          class="py-2 text-sm font-medium"
          @click="navigate"
        >
          {{ tab.label }}
        </a>
        <DocHelpTooltip v-if="tab.help" :term="tab.help" />
      </div>
    </RouterLink>
  </nav>
</template>
