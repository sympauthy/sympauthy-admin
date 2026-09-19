<script lang="ts" setup>
import { useSlots } from 'vue'
import CommonCard from './CommonCard.vue'

/**
 * The first thing on a record page: what identifies the record, in a grid of `SummaryField`s, with
 * the actions an operator takes on it beside them.
 *
 * It carries no heading — the breadcrumb above already names the record — and the sections under it
 * are `DetailSection`s rather than more of these.
 */
const slots = useSlots()
</script>

<template>
  <CommonCard>
    <!-- The actions sit beside the fields where there is room for both, and under them where
         putting them side by side would leave an identifier a hundred pixels to read itself in. -->
    <div class="flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
      <dl class="grid w-full min-w-0 grid-cols-1 gap-4 sm:flex-1 sm:grid-cols-3">
        <slot />
      </dl>
      <div v-if="slots.actions" class="shrink-0">
        <slot name="actions" />
      </div>
    </div>
  </CommonCard>
</template>
