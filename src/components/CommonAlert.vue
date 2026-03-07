<script setup lang='ts'>
const props = withDefaults(
  defineProps<{
    color?: 'danger'
  }>(),
  {
    color: 'danger'
  }
)
</script>

<template>
  <div class='border rounded w-full p-3' :class='props.color' role='alert'>
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

</style>
