<script lang="ts" setup>
import { computed } from 'vue'

/**
 * One column of a table, header side. It owns the padding and the label's text style, so a column
 * the collection cannot order on is drawn exactly like one it can.
 *
 * Width is the whole sizing model: a column is either shrink-wrapped around what it holds ([fit])
 * or takes a share of what is left. Neither the header nor the cell writes a width.
 */
const props = withDefaults(
  defineProps<{
    /** Takes only the width its content needs — a status, a date, a row of actions. */
    fit?: boolean
    /** Dropped below this width, for a column a narrower screen can do without. */
    hiddenBelow?: 'sm' | 'lg'
  }>(),
  {
    fit: false,
    hiddenBelow: undefined
  }
)

const classes = computed(() => [
  'field-label px-6 py-3 text-left',
  props.fit ? 'w-0 whitespace-nowrap' : '',
  props.hiddenBelow === 'sm' ? 'hidden sm:table-cell' : '',
  props.hiddenBelow === 'lg' ? 'hidden lg:table-cell' : ''
])
</script>

<template>
  <th :class="classes">
    <slot />
  </th>
</template>
