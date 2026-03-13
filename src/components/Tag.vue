<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  color: 'green' | 'red' | 'blue' | 'gray' | 'purple' | 'yellow'
}>()

const colorClasses: Record<string, string> = {
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  blue: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-100 text-gray-800',
  purple: 'bg-purple-100 text-purple-800',
  yellow: 'bg-yellow-100 text-yellow-800',
}

const classes = computed(() => [
  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
  colorClasses[props.color],
])
</script>

<template>
  <span :class="classes">
    <slot />
    <slot name="help" />
  </span>
</template>