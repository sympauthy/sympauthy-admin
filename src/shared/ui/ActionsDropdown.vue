<script lang="ts" setup>
import { computed, type Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { SaMenu } from '@sympauthy/design'
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

/**
 * The design system's menu, plus the one thing it cannot know: the scopes behind each action. A
 * caller lists them from the most used to the least, with what destroys last, and the menu draws a
 * rule before the first of those.
 */
const props = defineProps<{
  actions: ActionItem[]
}>()

const emit = defineEmits<{
  action: [key: string]
}>()

const { t } = useI18n()
const authStore = useAuthStore()

const items = computed(() =>
  props.actions.map(({ key, label, icon, danger, requiredScopes }) => ({
    key,
    label,
    icon,
    danger,
    disabledReason: missingScopesHint(authStore.missingScopes(requiredScopes ?? []))
  }))
)
</script>

<template>
  <SaMenu :label="t('common.actions')" :items="items" @select="emit('action', $event)" />
</template>
