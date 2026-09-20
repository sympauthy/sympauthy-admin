<script lang="ts" setup>
import { PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent } from 'reka-ui'
</script>

<template>
  <PopoverRoot>
    <PopoverTrigger
      type="button"
      class="cursor-help align-middle text-[0.85em] leading-none font-semibold whitespace-nowrap text-current opacity-60 hover:opacity-100"
    >
      &nbsp;ⓘ
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        side="bottom"
        align="center"
        :side-offset="4"
        :collision-padding="16"
        class="popover overlay-animated z-50 w-72 max-w-[calc(100vw-2rem)] p-3 text-sm font-normal tracking-normal text-gray-700 normal-case"
      >
        <slot />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
