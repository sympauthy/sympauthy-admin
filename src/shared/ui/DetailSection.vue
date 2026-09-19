<script lang="ts" setup>
defineProps<{
  title: string
}>()
</script>

<template>
  <div>
    <h2 class="mb-4 text-lg font-semibold text-gray-900">
      {{ title }}
      <slot name="help" />
    </h2>
    <slot />
  </div>
</template>
