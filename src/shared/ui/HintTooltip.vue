<script lang="ts" setup>
import {
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger
} from 'reka-ui'

/**
 * A sentence shown beside a control while the pointer rests on it or the keyboard focuses it — the
 * reason a disabled control cannot be used. Without a [text] it renders its content alone.
 *
 * The trigger is a wrapper rather than the control: a disabled button takes no pointer events and
 * no focus, so it could never open a tooltip of its own.
 */
withDefaults(
  defineProps<{
    text?: string
    side?: 'top' | 'right' | 'bottom' | 'left'
    /** Lays the wrapper out as a block, for a control filling its line — a sidebar entry. */
    block?: boolean
  }>(),
  {
    text: undefined,
    side: 'top',
    block: false
  }
)
</script>

<template>
  <TooltipProvider v-if="text" :delay-duration="150">
    <TooltipRoot>
      <TooltipTrigger as-child>
        <span tabindex="0" :class="block ? 'block' : 'inline-flex'" class="outline-none">
          <slot />
        </span>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent
          :side="side"
          :side-offset="4"
          :collision-padding="16"
          class="popover overlay-animated z-50 max-w-72 px-3 py-2 text-xs font-normal text-gray-700"
        >
          {{ text }}
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
  <slot v-else />
</template>
