<script lang="ts" setup>
import { type Component } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/20/solid'
import { useI18n } from 'vue-i18n'
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
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
  return authStore.missingScopes(action.requiredScopes ?? [])
}

// A destructive action closes the menu, under a rule, whatever its use: the item a slip of the
// pointer lands on is never the one that cannot be undone.
function startsDanger(index: number, actions: ActionItem[]): boolean {
  return index > 0 && actions[index].danger === true && actions[index - 1].danger !== true
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
        <template v-for="(action, index) in actions" :key="action.key">
          <DropdownMenuSeparator
            v-if="startsDanger(index, actions)"
            class="my-1 h-px bg-gray-200"
          />
          <DropdownMenuItem
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
        </template>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
