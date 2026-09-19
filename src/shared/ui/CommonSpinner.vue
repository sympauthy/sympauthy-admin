<script lang="ts" setup>
import { computed } from 'vue'

/**
 * A request in flight. The three sizes are the three places one is drawn: inside a control, beside
 * a line saying what is being waited for, and alone on a screen that is nothing but the wait.
 */
const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    size: 'md'
  }
)

const sizeClasses: Record<string, string> = {
  sm: 'size-4 border-2',
  md: 'size-6 border-4',
  lg: 'size-8 border-4'
}

const classes = computed(() => [
  'inline-block shrink-0 animate-spin rounded-full border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]',
  sizeClasses[props.size]
])
</script>

<template>
  <div :class="classes" role="status">
    <span
      class="absolute! -m-px! h-px! w-px! overflow-hidden! border-0! p-0! whitespace-nowrap! [clip:rect(0,0,0,0)]!"
    >
      <slot />
    </span>
  </div>
</template>
