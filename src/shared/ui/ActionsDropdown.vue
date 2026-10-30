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
import CommonButton from './CommonButton.vue'
import { type ButtonStyle, secondaryColoredButton } from './ButtonStyle'
import { useAuthStore } from '@/shared/auth'

export interface ActionItem {
  key: string
  label: string
  icon?: Component
  danger?: boolean
  /**
   * The admin scopes the call behind the action is made under. An item the token is not granted
   * all of is drawn disabled, naming them, rather than offered to fail at the server.
   */
  requiredScopes?: string[]
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
const authStore = useAuthStore()

function missingScopes(action: ActionItem): string[] {
  return (action.requiredScopes ?? []).filter((scope) => !authStore.hasAllScopes([scope]))
}
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger as-child>
      <CommonButton
        :button-style="buttonStyle"
        :label="t('common.actions')"
        :trailing-icon="ChevronDownIcon"
      />
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent align="end" :side-offset="4" class="menu overlay-animated min-w-48">
        <DropdownMenuItem
          v-for="action in actions"
          :key="action.key"
          class="menu-item"
          :class="
            missingScopes(action).length > 0
              ? 'cursor-not-allowed text-gray-400'
              : action.danger
                ? 'text-red-600 data-[highlighted]:bg-red-50'
                : 'text-gray-700 data-[highlighted]:bg-gray-100'
          "
          :disabled="missingScopes(action).length > 0"
          :title="
            missingScopes(action).length > 0
              ? t('common.missingScopes', { scopes: missingScopes(action).join(', ') })
              : undefined
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
