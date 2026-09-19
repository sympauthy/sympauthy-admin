<script lang="ts" setup>
import { computed, type Component } from 'vue'
import { type ButtonStyle, primaryColoredButton } from './ButtonStyle'
import CommonSpinner from './CommonSpinner.vue'

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
   * Drops the label below `sm:`, leaving the icon alone. For a button repeated down a table, where
   * the row beside it already says what the button acts on; a button standing on its own keeps its
   * label at every width.
   */
  collapseLabel?: boolean
  loading?: boolean
  submitting?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  buttonStyle: () => primaryColoredButton,
  label: undefined,
  icon: undefined,
  trailingIcon: undefined,
  collapseLabel: false,
  loading: false,
  submitting: false,
  disabled: false
})

const computedDisabled = computed(() => props.loading || props.submitting || props.disabled)

const computedClasses = computed(() => {
  if (props.disabled) {
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
  <button
    :class="computedClasses"
    :disabled="computedDisabled"
    :title="props.label"
    class="control font-medium transition-colors"
  >
    <span class="inline-flex w-full items-center justify-center gap-1.5">
      <CommonSpinner v-if="loading || submitting" size="sm" />
      <component :is="props.icon" v-else-if="props.icon" class="size-4 shrink-0" />
      <span :class="props.collapseLabel ? 'hidden sm:inline' : ''">
        <slot :name="stateSlot">{{ props.label }}</slot>
      </span>
      <component :is="props.trailingIcon" v-if="props.trailingIcon" class="size-4 shrink-0" />
    </span>
  </button>
</template>
