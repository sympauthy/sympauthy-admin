<script lang="ts" setup>
/**
 * Several lines of text an operator types. [rows] is the height it opens at, and the only thing
 * that distinguishes one from another.
 */
withDefaults(
  defineProps<{
    rows?: number
    /** For a value read character by character: a JSON document, a list of identifiers. */
    mono?: boolean
  }>(),
  {
    rows: 2,
    mono: false
  }
)

const model = defineModel<string>({ default: '' })
</script>

<template>
  <textarea
    v-model="model"
    :rows="rows"
    class="control control-focus block w-full bg-white text-base text-gray-900 placeholder:text-gray-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
    :class="mono ? 'font-mono' : ''"
  />
</template>
