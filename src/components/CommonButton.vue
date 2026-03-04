<script lang='ts' setup>

import { computed } from 'vue'
import { type ButtonStyle, primaryColoredButton } from '@/styles/ButtonStyle'
import CommonSpinner from '@/components/CommonSpinner.vue'

interface Props {
  buttonStyle?: ButtonStyle
  loading?: boolean
  submitting?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  buttonStyle: () => primaryColoredButton,
  loading: false,
  submitting: false,
  disabled: false
})

const computedDisabled = computed(() => props.loading || props.submitting || props.disabled)

const computedClasses = computed(() => {
  let classes = ''
  if (props.disabled) {
    classes = `${classes} ${props.buttonStyle?.disabledClasses}`
  } else if (props.loading) {
    classes = `${classes} ${props.buttonStyle?.loadingClasses}`
  } else if (props.submitting) {
    classes = `${classes} ${props.buttonStyle?.submittingClasses}`
  } else {
    classes = `${classes} ${props.buttonStyle?.activeClasses}`
  }
  return classes
})

</script>

<template>
  <button :class='computedClasses'
          :disabled='computedDisabled'
          class='btn'>
    <template v-if='loading'>
      <div class='w-full flex flex-row justify-center align-items-center'>
        <div class='me-2'>
          <common-spinner class='h-4 w-4 border-2'/>
        </div>
        <slot name='loading' />
      </div>
    </template>
    <template v-else-if='submitting'>
      <div class='w-full flex flex-row justify-center align-items-center'>
        <div class='me-2'>
          <common-spinner class='h-4 w-4 border-2'/>
        </div>
        <slot name='submitting' />
      </div>
    </template>
    <template v-else>
      <slot name='default' />
    </template>
  </button>
</template>

<style scoped></style>
