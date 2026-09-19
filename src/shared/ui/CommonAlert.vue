<script setup lang="ts">
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
</script>

<template>
  <div class="border rounded w-full p-3" :class="props.color" role="alert">
    <slot></slot>
  </div>
</template>

<style scoped>
/*noinspection CssUnusedSymbol*/
.danger {
  border-color: var(--color-red-50);
  color: var(--color-red-700);
  background-color: var(--color-red-100);
}

/*noinspection CssUnusedSymbol*/
.warning {
  border-color: var(--color-amber-50);
  color: var(--color-amber-800);
  background-color: var(--color-amber-100);
}
</style>
