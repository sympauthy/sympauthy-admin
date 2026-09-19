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
    class="control control-focus block w-full border-gray-300 bg-white shadow-sm disabled:cursor-not-allowed disabled:bg-gray-50"
    :class="mono ? 'font-mono' : ''"
  />
</template>
