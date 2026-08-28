<script lang="ts" setup>
import { useSlots } from 'vue'
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle } from 'reka-ui'

interface Props {
  open: boolean
  /** Heading text. Alternatively provide a `title` slot for rich content. */
  title?: string
  /** Block Esc / outside-click dismissal (e.g. while a request is in flight). */
  dismissDisabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  dismissDisabled: false
})

const emit = defineEmits<{
  close: []
}>()

const slots = useSlots()

// reka-ui runs in controlled mode: it only emits `update:open(false)` on a user
// dismissal (Esc / click outside), never when the parent flips the `open` prop.
// Mapping that to `close` therefore won't fire a spurious close after the parent
// programmatically closes the dialog (e.g. once a request succeeds).
function onOpenChange(value: boolean) {
  if (!value) emit('close')
}

function preventWhenDisabled(event: Event) {
  if (props.dismissDisabled) event.preventDefault()
}
</script>

<template>
  <DialogRoot :open="open" @update:open="onOpenChange">
    <DialogPortal>
      <DialogOverlay class="dialog-overlay fixed inset-0 z-50 bg-black/50" />
      <DialogContent
        class="dialog-content fixed left-1/2 top-1/2 z-50 mx-4 max-h-[calc(100vh-2rem)] w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
        :aria-describedby="undefined"
        @escape-key-down="preventWhenDisabled"
        @pointer-down-outside="preventWhenDisabled"
        @interact-outside="preventWhenDisabled"
      >
        <DialogTitle
          v-if="title || slots.title"
          as="h3"
          class="text-lg font-semibold text-gray-900 mb-4"
        >
          <slot name="title">{{ title }}</slot>
        </DialogTitle>
        <slot />
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.dialog-overlay[data-state='open'],
.dialog-content[data-state='open'] {
  animation: dialog-fade-in 200ms ease-out;
}
.dialog-overlay[data-state='closed'],
.dialog-content[data-state='closed'] {
  animation: dialog-fade-out 200ms ease-in;
}

@keyframes dialog-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes dialog-fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
