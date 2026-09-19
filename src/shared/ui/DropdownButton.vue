<script lang="ts" setup>
import { ChevronDownIcon } from '@heroicons/vue/20/solid'
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem
} from 'reka-ui'

withDefaults(
  defineProps<{
    label: string
    disabled?: boolean
    options: { label: string; value: string }[]
  }>(),
  {
    disabled: false
  }
)

const emit = defineEmits<{
  select: [value: string]
}>()
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger
      :disabled="disabled"
      class="flex items-center gap-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {{ label }}
      <ChevronDownIcon class="h-4 w-4 text-gray-500" />
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent
        align="end"
        :side-offset="4"
        class="dropdown-content z-10 w-max min-w-[var(--reka-dropdown-menu-trigger-width)] rounded border border-gray-200 bg-white shadow-lg"
      >
        <DropdownMenuItem
          v-for="option in options"
          :key="option.value"
          class="block w-full cursor-pointer px-4 py-2 text-left text-sm text-gray-700 outline-none first:rounded-t last:rounded-b data-[highlighted]:bg-gray-100"
          @select="emit('select', option.value)"
        >
          {{ option.label }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>

<style scoped>
.dropdown-content[data-state='open'] {
  animation: dropdown-in 120ms ease-out;
}
.dropdown-content[data-state='closed'] {
  animation: dropdown-out 100ms ease-in;
}

@keyframes dropdown-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes dropdown-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
