<script lang="ts" setup>
import { ref } from 'vue'
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/vue/20/solid'

defineProps<{
  value: string
  title?: string
}>()

const copied = ref(false)

async function copy(value: string) {
  await navigator.clipboard.writeText(value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
  <button
    type="button"
    class="shrink-0 text-gray-400 hover:text-gray-600 cursor-pointer"
    :title="title"
    @click="copy(value)"
  >
    <CheckIcon v-if="copied" class="size-4 text-green-500" />
    <ClipboardDocumentIcon v-else class="size-4" />
  </button>
</template>
