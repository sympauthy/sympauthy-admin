<script lang="ts" setup>
import CopyToClipboard from './CopyToClipboard.vue'

/**
 * A value an operator reads and then pastes elsewhere: the identifier a record is addressed by, in
 * a summary or a definition row. It is cut with an ellipsis rather than wrapped, and the control
 * that copies it in full stays beside it whatever the width leaves.
 */
defineProps<{
  value: string
  /** What the copy control says it copies. */
  title?: string
}>()
</script>

<template>
  <span class="flex min-w-0 items-center gap-1.5">
    <span class="truncate">{{ value }}</span>
    <CopyToClipboard :value="value" :title="title" />
  </span>
</template>
