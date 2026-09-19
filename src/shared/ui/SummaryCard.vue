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
    <div class="flex items-start justify-between gap-4">
      <dl class="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
        <slot />
      </dl>
      <div v-if="slots.actions" class="shrink-0">
        <slot name="actions" />
      </div>
    </div>
  </CommonCard>
</template>
