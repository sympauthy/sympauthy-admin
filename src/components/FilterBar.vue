<script lang="ts" setup>
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

export interface DropdownConfig {
  value: string
  options: { label: string; value: string }[]
}

withDefaults(
  defineProps<{
    searchPlaceholder?: string
    dropdowns?: DropdownConfig[]
  }>(),
  {
    searchPlaceholder: '',
    dropdowns: () => [],
  },
)

const emit = defineEmits<{
  search: [query: string]
  'dropdown-change': [index: number, value: string]
}>()

let searchTimeout: ReturnType<typeof setTimeout> | undefined

function onSearchInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    emit('search', value)
  }, 300)
}

function onDropdownChange(index: number, event: Event) {
  const value = (event.target as HTMLSelectElement).value
  emit('dropdown-change', index, value)
}
</script>

<template>
  <div class="mb-4">
    <div class="flex items-center gap-4">
      <div class="relative flex-1 max-w-md">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          :placeholder="searchPlaceholder"
          class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          @input="onSearchInput"
        />
      </div>
      <select
        v-for="(dropdown, index) in dropdowns"
        :key="index"
        :value="dropdown.value"
        class="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        @change="onDropdownChange(index, $event)"
      >
        <option
          v-for="option in dropdown.options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>
    <slot name="extra" />
  </div>
</template>
