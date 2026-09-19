<script lang="ts" setup>
import { computed } from 'vue'

/**
 * One cell of a table row. It carries the same padding as the header above it, and the text style
 * the cell's role asks for rather than one the page picks.
 *
 * The sizing props answer the header's: a cell under a [fit] column does not wrap, and a cell under
 * a column dropped on a phone is dropped with it.
 */
const props = withDefaults(
  defineProps<{
    /** The column identifying the record. One per row, and never a status. */
    primary?: boolean
    /** Does not wrap, under a column shrink-wrapped around it. */
    fit?: boolean
    /** Cut with an ellipsis rather than wrapped, under a column taking a share of the width. */
    truncate?: boolean
    /** For a value read character by character: an identifier, an address, a token. */
    mono?: boolean
    /** Dropped below this width. Matches the header's own. */
    hiddenBelow?: 'sm' | 'lg'
  }>(),
  {
    primary: false,
    fit: false,
    truncate: false,
    mono: false,
    hiddenBelow: undefined
  }
)

const classes = computed(() => [
  'px-6 py-4 text-sm',
  props.primary ? 'font-medium text-gray-900' : 'text-gray-500',
  props.fit ? 'whitespace-nowrap' : '',
  props.truncate ? 'truncate' : '',
  props.mono ? 'font-mono' : '',
  props.hiddenBelow === 'sm' ? 'hidden sm:table-cell' : '',
  props.hiddenBelow === 'lg' ? 'hidden lg:table-cell' : ''
])
</script>

<template>
  <td :class="classes">
    <slot />
  </td>
</template>
