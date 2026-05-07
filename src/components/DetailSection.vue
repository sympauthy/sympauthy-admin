<script lang="ts" setup>
defineProps<{
  title: string
}>()
</script>

<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-900 mb-4">
      {{ title }}
      <slot name="help" />
    </h2>
    <slot />
  </div>
</template>
