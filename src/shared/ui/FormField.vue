<script lang="ts" setup>
/**
 * One field of a form: the name of what is being filled in, the control filling it, and a line
 * under it for what the name alone does not say.
 *
 * It owns the space between the three, so a dialog stacking four fields does not decide it four
 * times.
 */
withDefaults(
  defineProps<{
    label: string
    /** A line under the control, for a format or a consequence the label cannot carry. */
    hint?: string
  }>(),
  {
    hint: undefined
  }
)
</script>

<template>
  <div>
    <label class="mb-1 block text-sm font-medium text-gray-700">
      {{ label }}
      <slot name="help" />
    </label>
    <slot />
    <p v-if="hint" class="mt-1 text-xs text-gray-500">{{ hint }}</p>
  </div>
</template>
