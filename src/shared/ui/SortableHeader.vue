<script lang="ts" setup>
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  label: string
  field: string
  currentSort?: string
  currentOrder?: string
}>()

const emit = defineEmits<{
  sort: [field: string]
}>()

function onClick() {
  emit('sort', props.field)
}
</script>

<template>
  <th
    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100"
    @click="onClick"
  >
    <span class="inline-flex items-center gap-1">
      {{ props.label }}
      <ChevronUpIcon
        v-if="props.currentSort === props.field && props.currentOrder === 'asc'"
        class="h-3 w-3"
      />
      <ChevronDownIcon
        v-else-if="props.currentSort === props.field && props.currentOrder === 'desc'"
        class="h-3 w-3"
      />
    </span>
  </th>
</template>
