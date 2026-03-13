<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'

const open = ref(false)
const tooltipRef = ref<HTMLElement>()

function toggle() {
  open.value = !open.value
}

function onClickOutside(event: MouseEvent) {
  if (open.value && tooltipRef.value && !tooltipRef.value.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <span ref="tooltipRef" class="relative">
    <button @click.stop="toggle" class="text-current opacity-60 hover:opacity-100 cursor-help text-[0.85em] font-semibold leading-none whitespace-nowrap align-middle" type="button">&nbsp;ⓘ</button>
    <div
      v-if="open"
      class="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 w-72 p-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg normal-case tracking-normal font-normal"
    >
      <slot />
    </div>
  </span>
</template>