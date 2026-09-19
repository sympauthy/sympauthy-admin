<script lang="ts" setup>
import { computed } from 'vue'

/**
 * One cell of a table row. It carries the same padding as the header above it, and the text style
 * the cell's role asks for rather than one the page picks.
 *
 * The sizing props answer the header's: a cell under a [fit] column does not wrap, and a cell under
 * a column dropped on a phone is dropped with it. Below `sm:` the row it belongs to is drawn as a
 * card, and the cell becomes a line of it under the name its [label] gives.
 */
const props = withDefaults(
  defineProps<{
    /**
     * The column's name, which the cell shows above its value once the row is a card. Every cell
     * carries it but the one identifying the record and the one holding the row's actions, which
     * name themselves.
     */
    label?: string
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
    label: undefined,
    primary: false,
    fit: false,
    truncate: false,
    mono: false,
    hiddenBelow: undefined
  }
)

// A truncated column is capped rather than sized by what it holds: a cell whose width is its own
// text cannot be cut, so the table would grow past the width it was given and scroll sideways
// instead of showing an ellipsis. The cut itself is on a block inside the cell, which is the one
// element a table's own sizing does not reach.
const classes = computed(() => [
  'px-6 py-4 text-sm',
  props.primary ? 'font-medium text-gray-900' : 'text-gray-500',
  props.fit ? 'whitespace-nowrap' : '',
  props.truncate ? 'max-w-0' : '',
  props.mono ? 'font-mono' : '',
  props.hiddenBelow === 'sm' ? 'hidden sm:table-cell' : '',
  props.hiddenBelow === 'lg' ? 'hidden lg:table-cell' : ''
])
</script>

<template>
  <td :class="classes" :data-label="props.label">
    <div v-if="props.truncate" class="cell-truncate truncate">
      <slot />
    </div>
    <slot v-else />
  </td>
</template>
