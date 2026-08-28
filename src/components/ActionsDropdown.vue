<script lang="ts" setup>
import { type Component } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/20/solid'
import { useI18n } from 'vue-i18n'
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem
} from 'reka-ui'
import CommonButton from '@/components/CommonButton.vue'
import { type ButtonStyle, secondaryColoredButton } from '@/styles/ButtonStyle'

export interface ActionItem {
  key: string
  label: string
  icon?: Component
  danger?: boolean
}

withDefaults(
  defineProps<{
    actions: ActionItem[]
    buttonStyle?: ButtonStyle
  }>(),
  {
    buttonStyle: () => secondaryColoredButton
  }
)

const emit = defineEmits<{
  action: [key: string]
}>()

const { t } = useI18n()
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger as-child>
      <CommonButton :button-style="buttonStyle" :title="t('common.actions')">
        <span class="inline-flex items-center gap-1.5">
          {{ t('common.actions') }}
          <ChevronDownIcon class="size-4" />
        </span>
      </CommonButton>
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent
        align="end"
        :side-offset="4"
        class="dropdown-content z-10 min-w-48 rounded-md border border-gray-200 bg-white shadow-lg"
      >
        <DropdownMenuItem
          v-for="action in actions"
          :key="action.key"
          class="flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-sm outline-none first:rounded-t-md last:rounded-b-md"
          :class="
            action.danger
              ? 'text-red-600 data-[highlighted]:bg-red-50'
              : 'text-gray-700 data-[highlighted]:bg-gray-100'
          "
          @select="emit('action', action.key)"
        >
          <component :is="action.icon" v-if="action.icon" class="size-4 shrink-0" />
          {{ action.label }}
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
