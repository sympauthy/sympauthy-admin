<script lang="ts" setup>
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter, type RouteLocationRaw } from 'vue-router'
import { SaTabs } from '@sympauthy/design'
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
 * the one open survives a reload. The design system's tabs know no router, so this says which is
 * current and what draws their links.
 */
const props = defineProps<{
  tabs: RecordTab[]
  /** Names the strip, as "Views of this user". */
  label: string
}>()

const route = useRoute()
const router = useRouter()

const items = computed(() =>
  props.tabs.map((tab) => ({
    key: tab.label,
    label: tab.label,
    link: { to: tab.to },
    current: router.resolve(tab.to).name === route.name
  }))
)

function helpOf(key: string) {
  return props.tabs.find((tab) => tab.label === key)?.help
}
</script>

<template>
  <SaTabs :tabs="items" :label="label" :link-as="RouterLink">
    <!-- The tab names its view, so its explanation belongs beside that name, on every tab rather
         than only the open one: a tab an operator has not opened is the one they are most likely to
         want explained. -->
    <template #help="{ tab }">
      <DocHelpTooltip v-if="helpOf(tab.key)" :term="helpOf(tab.key)!" />
    </template>
  </SaTabs>
</template>
