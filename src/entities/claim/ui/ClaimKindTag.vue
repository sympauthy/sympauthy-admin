<script lang="ts" setup>
import { computed } from 'vue'
import { SaEmptyValue, SaTag } from '@/shared/ui'
import { claimKindLabel } from '../model/ClaimResource'

/**
 * Whose a claim's value is, as a tag.
 *
 * A claim carrying no kind is an `SaEmptyValue`, which is what a cell with no value to show draws.
 * The server sends the field for every claim and leaves it null for the one it computes itself, so
 * an absent kind is an answer rather than a field this panel failed to read.
 */
const props = defineProps<{
  kind?: string
}>()

const color = computed<'blue' | 'gray' | 'purple'>(() => {
  switch (props.kind) {
    case 'personal':
      return 'purple'
    case 'application':
      return 'blue'
    default:
      return 'gray'
  }
})
</script>

<template>
  <SaTag v-if="kind" :color="color">
    {{ claimKindLabel(kind) }}
  </SaTag>
  <SaEmptyValue v-else />
</template>
