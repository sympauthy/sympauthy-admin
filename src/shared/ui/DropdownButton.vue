<script lang="ts" setup>
import { type Component } from 'vue'
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
    /** Drawn before the label, naming what the menu offers a second way. */
    icon?: Component
    /**
     * Drops the label below `sm:`, leaving the icons alone and keeping the label as the title.
     * The chevron stays: with nothing written on the control, it is what says a menu opens.
     */
    collapseLabel?: boolean
    disabled?: boolean
    options: { label: string; value: string }[]
  }>(),
  {
    icon: undefined,
    collapseLabel: false,
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
      :title="label"
      class="control control-focus flex shrink-0 items-center gap-1.5 border-gray-300 bg-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      <component :is="icon" v-if="icon" class="size-4 shrink-0" />
      <span :class="collapseLabel ? 'hidden sm:inline' : ''">{{ label }}</span>
      <ChevronDownIcon class="size-4 shrink-0 text-gray-500" />
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
