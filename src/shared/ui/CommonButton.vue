<script lang="ts" setup>
import { computed, type Component, type FunctionalComponent } from 'vue'
import { SaButton, SaTooltip, type SaButtonVariant } from '@sympauthy/design'
import { useAuthStore, missingScopesHint } from '@/shared/auth'

/**
 * The design system's button, plus the one thing it cannot know: the scopes behind it. Everything
 * else is handed down as it arrived.
 */
interface Props {
  variant?: SaButtonVariant
  /**
   * What the button does. Written here rather than in the default slot so that the button in
   * flight keeps saying it, and so that a button whose label is collapsed still carries it as a
   * title.
   */
  label?: string
  /** Drawn before the label, naming the action a second way. */
  icon?: Component
  /** Drawn after the label, for a button that opens something rather than doing it. */
  trailingIcon?: Component
  /**
   * Drops the label below `sm:`, leaving the icon alone and keeping the label as the title. For a
   * control of a toolbar, which is one row of them at every width; a button inside a table row
   * keeps its label, since below `sm:` that row is a card with the width to spare. Pass an [icon]
   * with it, or there is nothing left to press.
   */
  collapseLabel?: boolean
  loading?: boolean
  submitting?: boolean
  disabled?: boolean
  /**
   * The admin scopes the call behind the button is made under. A button the token is not granted
   * all of is drawn disabled, naming them in a `SaTooltip`, rather than offered to fail at the
   * server.
   */
  requiredScopes?: string[]
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<Props>(), {
  variant: undefined,
  label: undefined,
  icon: undefined,
  trailingIcon: undefined,
  collapseLabel: false,
  loading: false,
  submitting: false,
  disabled: false,
  requiredScopes: () => []
})

const authStore = useAuthStore()

const hint = computed(() => missingScopesHint(authStore.missingScopes(props.requiredScopes)))

// Renders its content as it is, standing in for `SaTooltip` around a button the token covers, so
// that one's element is the <button> itself: an `as-child` trigger positions against it.
const Bare: FunctionalComponent = (_, { slots }) => slots.default?.()[0]
</script>

<template>
  <component :is="hint ? SaTooltip : Bare" v-bind="hint ? { text: hint } : {}">
    <SaButton
      v-bind="$attrs"
      :variant="props.variant"
      :label="props.label"
      :icon="props.icon"
      :trailing-icon="props.trailingIcon"
      :collapse-label="props.collapseLabel"
      :loading="props.loading"
      :submitting="props.submitting"
      :disabled="props.disabled"
      :refused="hint !== undefined"
    >
      <template v-for="(_, name) in $slots" #[name]>
        <slot :name="name" />
      </template>
    </SaButton>
  </component>
</template>
