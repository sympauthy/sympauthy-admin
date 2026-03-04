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
  @apply border-red-50 text-red-700 bg-red-100;
}

</style>
