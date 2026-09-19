<script lang="ts" setup>
import { computed } from 'vue'

/**
 * One labelled value of a `SummaryCard`: the label above, the value under it.
 *
 * The value keeps the slot rather than a prop, since as often as not it is a `CommonTag`, a link
 * or an identifier carrying a `CopyToClipboard` beside it.
 */
const props = withDefaults(
  defineProps<{
    label: string
    /** For a value read character by character: an identifier, an address, a token. */
    mono?: boolean
  }>(),
  {
    mono: false
  }
)

const classes = computed(() => [
  'mt-1 text-sm text-gray-900',
  props.mono ? 'truncate font-mono' : ''
])
</script>

<template>
  <div class="min-w-0">
    <dt class="field-label">
      {{ label }}
      <slot name="help" />
    </dt>
    <dd :class="classes">
      <slot />
    </dd>
  </div>
</template>
