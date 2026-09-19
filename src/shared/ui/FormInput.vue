<script lang="ts" setup>
import { computed, useAttrs, type Component } from 'vue'

/**
 * A single line of text an operator types. The box it is drawn in is the one every other control
 * shares, so an input, a select and a button in the same row are the same height.
 */
const props = withDefaults(
  defineProps<{
    type?: string
    /** Drawn inside the field on its leading edge, for a field whose purpose the icon names. */
    icon?: Component
    /** For a value read character by character: an identifier, a token, a URL. */
    mono?: boolean
  }>(),
  {
    type: 'text',
    icon: undefined,
    mono: false
  }
)

const model = defineModel<string>({ default: '' })

// The field is wrapped, so that an icon has something to be positioned against. That wrapper is
// what a caller sizes — `class` reaches it — while everything else a caller says is said to the
// field itself: a placeholder on a `div` would never be read.
defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const fieldAttrs = computed(() => {
  const rest = { ...attrs }
  delete rest.class
  delete rest.style
  return rest
})

// The icon takes the room the leading padding would have, rather than sitting on top of it.
const classes = computed(() => [
  'control control-focus block w-full border-gray-300 bg-white shadow-sm',
  'disabled:cursor-not-allowed disabled:bg-gray-50',
  props.icon ? 'pl-9' : '',
  props.mono ? 'font-mono' : ''
])
</script>

<template>
  <div class="relative" :class="attrs.class" :style="attrs.style">
    <component
      :is="props.icon"
      v-if="props.icon"
      class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400"
    />
    <input v-bind="fieldAttrs" v-model="model" :type="props.type" :class="classes" />
  </div>
</template>
