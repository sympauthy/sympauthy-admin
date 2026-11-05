<script lang="ts" setup>
import { computed, type Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { EllipsisHorizontalIcon } from '@heroicons/vue/20/solid'
import { SaMenu } from '@sympauthy/design'
import { missingScopesHint, useAuthStore } from '@/shared/auth'

export interface ActionItem {
  key: string
  label: string
  icon?: Component
  danger?: boolean
  /** Draws a rule before the action, for a group that is not about destroying. */
  startsGroup?: boolean
  /**
   * The admin scopes the call behind the action is made under. An item the token is not granted
   * all of is drawn disabled, naming them, rather than offered to fail at the server.
   */
  requiredScopes?: string[]
}

/**
 * The design system's menu, plus the one thing it cannot know: the scopes behind each action. A
 * caller lists them from the most used to the least, with what destroys last, and the menu draws a
 * rule before the first of those.
 */
const props = defineProps<{
  actions: ActionItem[]
  /** What a table row's actions are done to, which draws the button as its mark alone. */
  record?: string
}>()

const emit = defineEmits<{
  action: [key: string]
}>()

const { t } = useI18n()
const authStore = useAuthStore()

const items = computed(() =>
  props.actions.map(({ key, label, icon, danger, startsGroup, requiredScopes }) => ({
    key,
    label,
    icon,
    danger,
    startsGroup,
    disabledReason: missingScopesHint(authStore.missingScopes(requiredScopes ?? []))
  }))
)
</script>

<template>
  <SaMenu
    :label="props.record ? t('common.actionsFor', { name: props.record }) : t('common.actions')"
    :icon="props.record ? EllipsisHorizontalIcon : undefined"
    :collapsed-icon="props.record ? undefined : EllipsisHorizontalIcon"
    :items="items"
    @select="emit('action', $event)"
  >
    <template v-if="$slots.expanded" #expanded>
      <slot name="expanded" />
    </template>
  </SaMenu>
</template>
