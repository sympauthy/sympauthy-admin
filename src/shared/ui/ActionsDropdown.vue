<script lang="ts" setup>
import { computed, type Component } from 'vue'
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
import { missingScopesHint, useAuthStore } from '@/shared/auth'

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

const props = withDefaults(
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

// Each action with the sentence it is disabled with, read once per render rather than once per place
// the item asks.
const items = computed(() =>
  props.actions.map((action) => ({
    ...action,
    hint: missingScopesHint(authStore.missingScopes(action.requiredScopes ?? []))
  }))
)

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
        <template v-for="(action, index) in items" :key="action.key">
          <DropdownMenuSeparator v-if="startsDanger(index, items)" class="my-1 h-px bg-gray-200" />
          <DropdownMenuItem
            class="menu-item"
            :class="
              action.hint
                ? 'cursor-not-allowed text-gray-400'
                : action.danger
                  ? 'text-red-600 data-[highlighted]:bg-red-50'
                  : 'text-gray-700 data-[highlighted]:bg-gray-100'
            "
            :disabled="action.hint !== undefined"
            @select="emit('action', action.key)"
          >
            <component
              :is="action.icon"
              v-if="action.icon"
              class="mt-0.5 size-4 shrink-0 self-start"
            />
            <!-- The reason sits under the label rather than in a tooltip: a menu is read while it is
                 open, and a hover over one of its items is a highlight, not a question. -->
            <span class="flex flex-col">
              {{ action.label }}
              <span v-if="action.hint" class="text-xs">{{ action.hint }}</span>
            </span>
          </DropdownMenuItem>
        </template>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
