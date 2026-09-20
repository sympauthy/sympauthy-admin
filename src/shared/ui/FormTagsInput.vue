<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { XMarkIcon } from '@heroicons/vue/20/solid'
import {
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
  TagsInputRoot
} from 'reka-ui'

/**
 * Several values entered one at a time, each becoming a tag as it is entered. It is what a list is
 * asked for with, where a single field would make the operator know the separator the list travels
 * under — and a value already entered is removed by the control beside it rather than by finding
 * it inside a sentence.
 */
withDefaults(
  defineProps<{
    /** Named in the empty field, since the tags beside it say nothing about what goes in. */
    placeholder?: string
    /** Names the field, which the label beside it does not do — it points at nothing. */
    ariaLabel?: string
  }>(),
  {
    placeholder: undefined,
    ariaLabel: undefined
  }
)

const model = defineModel<string[]>({ default: () => [] })

const { t } = useI18n()

// What has been typed into the field and not yet entered. The primitive keeps it in the DOM and
// hands it over on Enter; this is the copy a caller can ask for before that.
const pending = ref('')

function onPendingInput(event: Event) {
  pending.value = (event.target as HTMLInputElement).value
}

// The field is cleared by the primitive itself when it accepts a value, and cleared without an
// input event, so what is pending goes with the list it just joined.
watch(model, () => {
  pending.value = ''
})

/**
 * Enters what has been typed but not yet confirmed, and answers whether anything was.
 *
 * A caller about to take the control away asks for this: `addOnBlur` covers a focus moving on
 * within the page, but an overlay dismissed on the pointer going down is torn away before the
 * field can lose the focus at all, and the value would go with it.
 */
function flush() {
  const value = pending.value.trim()
  pending.value = ''
  if (value === '' || model.value.includes(value)) {
    return
  }
  model.value = [...model.value, value]
}

defineExpose({ flush })
</script>

<template>
  <TagsInputRoot
    v-model="model"
    add-on-blur
    class="control control-focus-within flex w-full flex-wrap items-center gap-1 border-gray-300 bg-white"
  >
    <TagsInputItem
      v-for="value in model"
      :key="value"
      :value="value"
      class="flex max-w-full items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
    >
      <TagsInputItemText class="truncate" />
      <TagsInputItemDelete
        class="shrink-0 text-gray-400 outline-none hover:text-gray-600 focus-visible:text-gray-900"
        :aria-label="t('common.remove')"
      >
        <XMarkIcon class="size-3" />
      </TagsInputItemDelete>
    </TagsInputItem>

    <TagsInputInput
      class="min-w-16 flex-1 bg-transparent text-sm outline-none"
      :placeholder="placeholder"
      :aria-label="ariaLabel"
      @input="onPendingInput"
    />
  </TagsInputRoot>
</template>
