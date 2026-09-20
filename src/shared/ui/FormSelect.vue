<script lang="ts" setup>
/**
 * A choice among the values a field admits, written as `option` elements in the default slot. It
 * shares its box with every other control, and a caller whose list the deployment sizes reaches
 * for `FormListbox` instead.
 */
const model = defineModel<string>({ default: '' })
</script>

<template>
  <select
    v-model="model"
    class="control control-focus block w-full border-gray-300 bg-white shadow-sm disabled:cursor-not-allowed disabled:bg-gray-50"
  >
    <slot />
  </select>
</template>
