<script lang="ts" setup>
/**
 * A link out of the panel, to the page of the public documentation covering the term beside it.
 * It always opens elsewhere, so an operator reading an explanation does not lose the screen that
 * raised the question.
 */
defineProps<{
  href: string
}>()
</script>

<template>
  <a :href="href" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">
    <slot />
  </a>
</template>
