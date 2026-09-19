<script lang="ts" setup>
import { computed } from 'vue'

/**
 * What a screen has to keep saying: a call it could not make, or something missing from what it
 * drew. Every one of them is this box — a dialog reporting a rejected submission says it the same
 * way a page reporting a failed fetch does.
 */
const props = withDefaults(
  defineProps<{
    /**
     * `warning` is for a screen that is still usable with something missing from it; `danger` for
     * one that could not render what it was asked to.
     */
    color?: 'danger' | 'warning'
  }>(),
  {
    color: 'danger'
  }
)

const colorClasses: Record<string, string> = {
  danger: 'border-red-200 bg-red-50 text-red-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-800'
}

const classes = computed(() => ['w-full rounded-md border p-3 text-sm', colorClasses[props.color]])
</script>

<template>
  <div :class="classes" role="alert">
    <slot />
  </div>
</template>
