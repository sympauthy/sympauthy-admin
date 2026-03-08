<script lang="ts" setup>
import { reactive, computed } from 'vue'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import DropdownButton from '@/components/DropdownButton.vue'

export type FilterConfig = {
  key: string
  label: string
} & (
  | { type: 'text' }
  | { type: 'select'; options: { label: string; value: string }[] }
)

const props = withDefaults(
  defineProps<{
    searchPlaceholder?: string
    filters?: FilterConfig[]
  }>(),
  {
    searchPlaceholder: '',
    filters: () => [],
  },
)

const emit = defineEmits<{
  search: [query: string]
  'filter-change': [key: string, value: string]
  'filter-remove': [key: string]
}>()

const activeFilters = reactive(new Map<string, string>())
const filterTimeouts: Record<string, ReturnType<typeof setTimeout>> = {}

let searchTimeout: ReturnType<typeof setTimeout> | undefined

function onSearchInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    emit('search', value)
  }, 300)
}

const availableFilterOptions = computed(() =>
  props.filters
    .filter((f) => !activeFilters.has(f.key))
    .map((f) => ({ label: f.label, value: f.key })),
)

function addFilter(key: string) {
  activeFilters.set(key, '')
}

function onFilterValueChange(key: string, event: Event) {
  const filter = props.filters.find((f) => f.key === key)
  const value = (event.target as HTMLInputElement | HTMLSelectElement).value
  activeFilters.set(key, value)

  if (filter && filter.type === 'text') {
    if (filterTimeouts[key]) clearTimeout(filterTimeouts[key])
    filterTimeouts[key] = setTimeout(() => {
      emit('filter-change', key, value)
    }, 300)
  } else {
    emit('filter-change', key, value)
  }
}

function removeFilter(key: string) {
  activeFilters.delete(key)
  if (filterTimeouts[key]) clearTimeout(filterTimeouts[key])
  emit('filter-remove', key)
}

function getFilterConfig(key: string): FilterConfig | undefined {
  return props.filters.find((f) => f.key === key)
}
</script>

<template>
  <div class="mb-4">
    <div class="flex items-center gap-4">
      <div class="relative flex-1">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          :placeholder="searchPlaceholder"
          class="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          @input="onSearchInput"
        />
      </div>
      <DropdownButton
        :label="$t('pages.users.addFilter')"
        :disabled="availableFilterOptions.length === 0"
        :options="availableFilterOptions"
        @select="addFilter"
      />
    </div>

    <div v-if="activeFilters.size > 0" class="flex flex-wrap gap-2 mt-3">
      <div
        v-for="[key, value] in activeFilters"
        :key="key"
        class="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1 text-sm bg-gray-50"
      >
        <span class="text-gray-600 font-medium">{{ getFilterConfig(key)?.label }}:</span>
        <select
          v-if="getFilterConfig(key)?.type === 'select'"
          :value="value"
          class="border-none bg-white text-sm focus:outline-none focus:ring-0 py-0 pl-1 pr-6"
          @change="onFilterValueChange(key, $event)"
        >
          <option
            v-for="option in (getFilterConfig(key) as FilterConfig & { type: 'select' }).options"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
        <input
          v-else
          type="text"
          :value="value"
          class="border-none bg-white text-sm focus:outline-none focus:ring-0 py-0 px-1 w-24"
          @input="onFilterValueChange(key, $event)"
        />
        <button
          class="text-gray-400 hover:text-gray-600"
          @click="removeFilter(key)"
        >
          <XMarkIcon class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>
