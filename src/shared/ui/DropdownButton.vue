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
      class="control control-focus flex shrink-0 items-center gap-1.5 border-gray-300 bg-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {{ label }}
      <ChevronDownIcon class="size-4 text-gray-500" />
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent
        align="end"
        :side-offset="4"
        class="menu overlay-animated w-max min-w-[var(--reka-dropdown-menu-trigger-width)]"
      >
        <DropdownMenuItem
          v-for="option in options"
          :key="option.value"
          class="menu-item text-gray-700 data-[highlighted]:bg-gray-100"
          @select="emit('select', option.value)"
        >
          {{ option.label }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
