<script lang="ts" setup>
import { computed } from 'vue'
import { SaTag } from '@sympauthy/design'
import { scopeTypeTag } from '../model/ScopeResource'

/**
 * A scope, or the name of a scope type, drawn as its type has it: `ScopeTypeLegend` says what each
 * look means.
 */
const props = defineProps<{
  /** The type of the scope, where it is known. */
  type?: string
}>()

const tag = computed(() => scopeTypeTag(props.type))
</script>

<template>
  <SaTag :color="tag.color" :variant="tag.variant">
    <slot />
  </SaTag>
</template>
