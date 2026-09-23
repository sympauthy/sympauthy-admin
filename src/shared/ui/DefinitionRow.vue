<script lang="ts" setup>
import { computed } from 'vue'

/**
 * One field of a `DefinitionList`: its label, and the value beside it from `sm:` and under it below.
 *
 * The label takes the `label` slot where it is not a sentence — the keys of a failure's values are
 * the server's own identifiers, and are read in the monospace face the value is.
 */
const props = withDefaults(
  defineProps<{
    label?: string
    /** For a value read character by character: an identifier, an address, a token. */
    mono?: boolean
  }>(),
  {
    label: undefined,
    mono: false
  }
)

// `wrap-anywhere` rather than `break-words`: a value the server wrote may be one token with nowhere
// to break — a key, a thumbprint, an address — and only `anywhere` takes that token out of the
// column's min-content width. `break-word` alone would hyphenate the line and still size the grid
// column to the whole token, which is the row scrolling the page sideways on a phone.
const classes = computed(() => [
  'mt-1 text-sm wrap-anywhere text-gray-900 sm:col-span-2 sm:mt-0',
  props.mono ? 'font-mono break-all' : ''
])
</script>

<template>
  <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:items-center sm:gap-4 sm:px-6">
    <dt class="field-label">
      <slot name="label">{{ label }}</slot>
    </dt>
    <dd :class="classes">
      <slot />
    </dd>
  </div>
</template>
