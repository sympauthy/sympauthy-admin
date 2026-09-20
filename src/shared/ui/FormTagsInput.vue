<script lang="ts" setup>
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
  }>(),
  {
    placeholder: undefined
  }
)

const model = defineModel<string[]>({ default: () => [] })

const { t } = useI18n()
</script>

<template>
  <TagsInputRoot
    v-model="model"
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
    />
  </TagsInputRoot>
</template>
