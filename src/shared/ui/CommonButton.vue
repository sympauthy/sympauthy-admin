<script lang="ts" setup>
import { computed, useAttrs, type Component, type FunctionalComponent } from 'vue'
import { type ButtonStyle, primaryColoredButton } from './ButtonStyle'
import CommonSpinner from './CommonSpinner.vue'
import HintTooltip from './HintTooltip.vue'
import { useAuthStore, missingScopesHint } from '@/shared/auth'

interface Props {
  buttonStyle?: ButtonStyle
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
   * all of is drawn disabled, naming them in a `HintTooltip`, rather than offered to fail at the
   * server.
   */
  requiredScopes?: string[]
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<Props>(), {
  buttonStyle: () => primaryColoredButton,
  label: undefined,
  icon: undefined,
  trailingIcon: undefined,
  collapseLabel: false,
  loading: false,
  submitting: false,
  disabled: false,
  requiredScopes: () => []
})

const attrs = useAttrs()
const authStore = useAuthStore()

const hint = computed(() => missingScopesHint(authStore.missingScopes(props.requiredScopes)))

// A button the token is refused stays focusable and takes the pointer, which is what lets it open
// the tooltip saying why: it is `aria-disabled` rather than `disabled`, so the caller's own click
// handler is what it drops, and a click it receives does nothing — inside a form, not even submit.
const buttonAttrs = computed(() => {
  if (!hint.value) {
    return attrs
  }
  const rest = Object.fromEntries(Object.entries(attrs).filter(([name]) => name !== 'onClick'))
  return { ...rest, 'aria-disabled': 'true', onClick: (event: Event) => event.preventDefault() }
})

const computedDisabled = computed(
  () => !hint.value && (props.loading || props.submitting || props.disabled)
)

// Renders its content as it is, standing in for `HintTooltip` around a button the token covers, so
// that one's element is the <button> itself: an `as-child` trigger positions against it.
const Bare: FunctionalComponent = (_, { slots }) => slots.default?.()[0]

const computedClasses = computed(() => {
  if (props.disabled || hint.value) {
    return props.buttonStyle.disabledClasses
  } else if (props.loading) {
    return props.buttonStyle.loadingClasses
  } else if (props.submitting) {
    return props.buttonStyle.submittingClasses
  } else {
    return props.buttonStyle.activeClasses
  }
})

// A state names its own slot, so a caller can say `Saving…` where the label alone would not do. The
// label is the fallback for all three, which is what most of them want.
const stateSlot = computed(() => {
  if (props.submitting) return 'submitting'
  if (props.loading) return 'loading'
  return 'default'
})
</script>

<template>
  <component :is="hint ? HintTooltip : Bare" v-bind="hint ? { text: hint } : {}">
    <button
      v-bind="buttonAttrs"
      :class="computedClasses"
      :disabled="computedDisabled"
      :title="props.label"
      class="control flex items-center justify-center gap-1.5 font-medium transition-colors"
    >
      <CommonSpinner v-if="loading || submitting" size="sm" />
      <component :is="props.icon" v-else-if="props.icon" class="size-4 shrink-0" />
      <span :class="props.collapseLabel ? 'hidden sm:inline' : ''">
        <slot :name="stateSlot">{{ props.label }}</slot>
      </span>
      <component :is="props.trailingIcon" v-if="props.trailingIcon" class="size-4 shrink-0" />
    </button>
  </component>
</template>
