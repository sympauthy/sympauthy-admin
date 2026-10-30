<script lang="ts" setup>
import { ref } from 'vue'
import { TooltipContent, TooltipPortal, TooltipRoot, TooltipTrigger } from 'reka-ui'

/**
 * A sentence shown beside a control while the pointer rests on it, the keyboard focuses it or a
 * finger taps it — the reason a disabled control cannot be used.
 *
 * The control is the trigger, so it has to take the pointer and the focus a disabled one would
 * refuse: it is marked `aria-disabled` rather than `disabled`. The delay is the `TooltipProvider`'s
 * at the root of the app, which is also what lets a pointer moving between two of them skip it.
 */
withDefaults(
  defineProps<{
    text: string
    side?: 'top' | 'right' | 'bottom' | 'left'
  }>(),
  {
    side: 'top'
  }
)

const open = ref(false)

// reka-ui opens a tooltip on a mouse and leaves a touch alone, since a finger has no hover. A tap on
// a control that does nothing is the question this answers, so a tap toggles it; tapping anywhere
// else closes it, as it closes any overlay.
function onPointerUp(event: PointerEvent) {
  if (event.pointerType === 'touch') {
    open.value = !open.value
  }
}
</script>

<template>
  <TooltipRoot v-model:open="open" disable-closing-trigger>
    <TooltipTrigger as-child @pointerup="onPointerUp">
      <slot />
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
</template>
