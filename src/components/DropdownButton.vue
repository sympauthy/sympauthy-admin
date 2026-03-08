<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'

withDefaults(
  defineProps<{
    label: string
    disabled?: boolean
    options: { label: string; value: string }[]
  }>(),
  {
    disabled: false,
  },
)

const emit = defineEmits<{
  select: [value: string]
}>()

const open = ref(false)
const dropdownRef = ref<HTMLElement>()

function toggle() {
  open.value = !open.value
}

function selectOption(value: string) {
  emit('select', value)
  open.value = false
}

function onClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <button
      :disabled="disabled"
      class="flex items-center gap-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      @click="toggle"
    >
      {{ label }}
      <ChevronDownIcon class="h-4 w-4 text-gray-500" />
    </button>
    <div
      v-if="open && options.length > 0"
      class="absolute right-0 mt-1 min-w-full w-max bg-white border border-gray-200 rounded shadow-lg z-10"
    >
      <button
        v-for="option in options"
        :key="option.value"
        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t last:rounded-b"
        @click="selectOption(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>
