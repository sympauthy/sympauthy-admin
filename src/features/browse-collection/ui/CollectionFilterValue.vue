<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { FormInput, FormListbox, FormTagsInput } from '@/shared/ui'
import type { CollectionCriterion } from '../model/CollectionCriteria'
import { collectionFilterValues, type CollectionFilter } from '../model/CollectionFilter'
import { isMultiValuedOperator } from '../model/CollectionOperatorUtils'

/**
 * The control one criterion's value is filled in with: the set the field publishes where that set
 * is closed, and the field's own type where it is open.
 *
 * It renders nothing for an operator taking no value; the popover holding it decides not to ask.
 */
const props = defineProps<{
  filter: CollectionFilter
  criterion: CollectionCriterion
}>()

const emit = defineEmits<{
  update: [patch: Partial<Omit<CollectionCriterion, 'id'>>]
  /** The value is written and the popover has nothing more to ask. */
  submit: []
}>()

const { t } = useI18n()

const multiValued = computed(() => isMultiValuedOperator(props.criterion.operator))

const options = computed(() => {
  const values = collectionFilterValues(props.filter, t('common.yes'), t('common.no'))
  return values?.map((value) => ({ value: value.value, label: value.name })) ?? null
})

// One value or several, the list is what the option list reads; which of the two the criterion
// holds is the operator's answer.
const selected = computed(() => {
  if (multiValued.value) {
    return props.criterion.values
  }
  return props.criterion.value === '' ? [] : [props.criterion.value]
})

const typedValues = computed({
  get: () => props.criterion.values,
  set: (values: string[]) => emit('update', { values })
})

const inputType = computed(() => {
  switch (props.filter.type) {
    case 'date':
      return 'date'
    case 'date_time':
      return 'datetime-local'
    case 'number':
      return 'number'
    default:
      return 'text'
  }
})

/**
 * Reads a pick from the option list.
 *
 * The list answers a pick whether or not it changed anything, and one value replaces the value it
 * already holds — so picking what is already picked would ask the collection again for the answer
 * it is showing, and ask it from the first page.
 */
function onSelect(values: string[]) {
  if (multiValued.value) {
    emit('update', { values })
    return
  }
  const value = values[0] ?? ''
  if (value !== props.criterion.value) {
    emit('update', { value })
  }
}

/**
 * Reads Enter as the end of a value typed into a field.
 *
 * An input method confirming a candidate sends the same key, and that Enter belongs to the word
 * being written rather than to the filter around it. The two lists do not go through here at all:
 * one adds a value with Enter and the other picks one with it.
 */
const tags = ref<InstanceType<typeof FormTagsInput> | null>(null)

/**
 * Settles what the rendered control holds but has not handed over yet.
 *
 * Only a list of values has any: the others write every keystroke straight into the criterion.
 */
function flush() {
  tags.value?.flush()
}

defineExpose({ flush })

function onValueKeydown(event: KeyboardEvent) {
  if (event.isComposing) {
    return
  }
  emit('submit')
}
</script>

<template>
  <FormListbox
    v-if="options"
    :options="options"
    :selected="selected"
    :multiple="multiValued"
    :search-placeholder="t('common.collection.searchValues')"
    :aria-label="props.filter.name"
    @select="onSelect"
  />

  <!-- An `in` over a field publishing no values: the caller enters the list themselves, one value
       at a time, and never meets the comma the grammar joins them back with. -->
  <FormTagsInput
    v-else-if="multiValued"
    ref="tags"
    v-model="typedValues"
    :placeholder="t('common.collection.addValue')"
    :aria-label="props.filter.name"
  />

  <FormInput
    v-else
    :type="inputType"
    :model-value="props.criterion.value"
    :aria-label="props.filter.name"
    @update:model-value="(value: string) => emit('update', { value })"
    @keydown.enter="onValueKeydown"
  />
</template>
