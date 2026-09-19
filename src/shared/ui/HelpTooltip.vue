<script lang="ts" setup>
import { PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent } from 'reka-ui'
</script>

<template>
  <PopoverRoot>
    <PopoverTrigger
      type="button"
      class="cursor-help align-middle text-[0.85em] font-semibold leading-none whitespace-nowrap text-current opacity-60 hover:opacity-100"
    >
      &nbsp;ⓘ
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        side="bottom"
        align="center"
        :side-offset="4"
        :collision-padding="16"
        class="popover-content z-50 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-gray-200 bg-white p-3 text-sm font-normal normal-case tracking-normal text-gray-700 shadow-lg"
      >
        <slot />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<style scoped>
.popover-content[data-state='open'] {
  animation: popover-in 120ms ease-out;
}
.popover-content[data-state='closed'] {
  animation: popover-out 100ms ease-in;
}

@keyframes popover-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes popover-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
