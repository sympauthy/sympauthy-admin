<script lang="ts" setup>
/**
 * The box everything on a record page is drawn in. It owns the one padding a card steps through,
 * so a screen never decides how much room its own content is given.
 */
withDefaults(
  defineProps<{
    /** Left unpadded for content that pads its own rows — a list, a table. */
    padded?: boolean
  }>(),
  {
    padded: true
  }
)
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white" :class="padded ? 'p-4 sm:p-6' : ''">
    <slot />
  </div>
</template>
