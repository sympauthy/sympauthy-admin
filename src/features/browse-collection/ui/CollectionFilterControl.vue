<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { XMarkIcon } from '@heroicons/vue/20/solid'
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'
import type { CollectionOperator } from '@/shared/api'
import { FormField, FormSelect } from '@/shared/ui'
import { isCriterionComplete, type CollectionCriterion } from '../model/CollectionCriteria'
import { collectionFilterValues, type CollectionFilter } from '../model/CollectionFilter'
import {
  collectionOperatorLabelKey,
  isMultiValuedOperator,
  isValuelessOperator
} from '../model/CollectionOperatorUtils'
import CollectionFilterValue from './CollectionFilterValue.vue'

/**
 * One criterion of a collection: a control reading it as a sentence, and the popover the operator
 * and the value are filled in from.
 *
 * It is drawn as a control and not as a chip, because it is one: the row it sits in is under the
 * row holding the search field, and a filter that reads as a tag beside a field that reads as a box
 * is two families on one screen. The value moved into the popover for the same reason — inside the
 * sentence it had no room for a box of its own, and an input without one cannot be seen.
 *
 * A field may carry more than one of these — that is how a range is asked for — so it is addressed
 * by the criterion's own id and never by its field.
 */
const props = withDefaults(
  defineProps<{
    filter: CollectionFilter
    criterion: CollectionCriterion
    /** Set on the criterion just added, whose value is what the caller opened the menu to give. */
    openOnMount?: boolean
  }>(),
  {
    openOnMount: false
  }
)

const emit = defineEmits<{
  update: [patch: Partial<Omit<CollectionCriterion, 'id'>>]
  remove: []
}>()

const { t } = useI18n()

const open = ref(props.openOnMount)
// What the popover focuses when it opens, read off the DOM rather than exposed by each of the
// value controls: which of them is rendered is the field's business and not this component's.
const valueBox = ref<HTMLElement | null>(null)
const value = ref<InstanceType<typeof CollectionFilterValue> | null>(null)

const valueless = computed(() => isValuelessOperator(props.criterion.operator))

const operatorOptions = computed(() =>
  props.filter.operators.map((operator) => ({
    value: operator,
    label: t(collectionOperatorLabelKey(operator, props.filter.type))
  }))
)

const operatorLabel = computed(() =>
  t(collectionOperatorLabelKey(props.criterion.operator, props.filter.type))
)

// A value the field published is read under the name it published it with, and one the caller
// typed under what they typed.
const valueLabel = computed(() => {
  const values = collectionFilterValues(props.filter, t('common.yes'), t('common.no'))
  const named = (value: string) => values?.find((known) => known.value === value)?.name ?? value
  if (isMultiValuedOperator(props.criterion.operator)) {
    return props.criterion.values.map(named).join(', ')
  }
  return props.criterion.value === '' ? '' : named(props.criterion.value)
})

// What the trigger reads when it is too narrow to show it all, which has to be the same sentence:
// a filter still waiting for a value says so on the row, and a title stopping before that part
// hides the one thing the caller has left to do.
const shownValue = computed(() =>
  valueLabel.value === '' ? t('common.collection.selectValue') : valueLabel.value
)

const title = computed(() =>
  [props.filter.name, operatorLabel.value, valueless.value ? '' : shownValue.value]
    .filter((part) => part !== '')
    .join(' ')
)

function onOperatorChange(operator: string) {
  // The value is cleared with the operator: `in` holds a list where the others hold one value and
  // `is_null` holds neither, so carrying one across would ask the new operator the old question.
  emit('update', { operator: operator as CollectionOperator, value: '', values: [] })
}

/**
 * A criterion still unanswerable when its popover closes is dropped.
 *
 * The caller opened a filter and left without filling it in: it narrows nothing, and leaving it on
 * the row is a sentence that stops halfway beside an affordance they have to guess at.
 */
function onOpenChange(opened: boolean) {
  open.value = opened
  if (opened) {
    return
  }
  // The value settles before it is judged. A list of values holds what was typed into it and not
  // yet entered, and this popover is dismissed on the pointer going down outside it — before the
  // field could lose the focus and hand it over on its own.
  value.value?.flush()
  if (!isCriterionComplete(props.criterion)) {
    emit('remove')
  }
}

/**
 * Opens on the value rather than on the operator.
 *
 * The operator is the first control the popover holds and the one a caller most often keeps, so the
 * focus the primitive would give it is a tab away from what they came to write. Where there is
 * nothing to fill in — `is_null` — the primitive's own choice stands.
 */
function onOpenAutoFocus(event: Event) {
  // The field the value is written in first, and the list itself where there is none to write in:
  // a `querySelector` over all three would answer whichever the markup happens to nest first.
  const box = valueBox.value
  const control =
    box?.querySelector<HTMLElement>('input, select') ??
    box?.querySelector<HTMLElement>('[role="listbox"]')
  if (!control) {
    return
  }
  event.preventDefault()
  control.focus()
}
</script>

<template>
  <PopoverRoot :open="open" @update:open="onOpenChange">
    <!-- The box is the wrapper's and the two controls inside it are real ones, so removing a filter
         stays one press and stays reachable from the keyboard. -->
    <div
      class="control control-focus-within flex max-w-full items-center overflow-hidden border-gray-300 bg-white p-0 text-gray-700"
    >
      <PopoverTrigger
        class="flex min-w-0 items-center gap-1 py-2 pr-1 pl-3 text-left outline-none"
        :title="title"
      >
        <span class="shrink-0 font-medium text-gray-600">{{ props.filter.name }}</span>
        <span class="shrink-0 text-gray-500">{{ operatorLabel }}</span>
        <span
          v-if="!valueless"
          class="min-w-0 truncate"
          :class="valueLabel === '' ? 'text-gray-400' : 'font-medium text-gray-900'"
        >
          {{ shownValue }}
        </span>
      </PopoverTrigger>

      <button
        class="shrink-0 py-2 pr-2.5 pl-1 text-gray-400 outline-none hover:text-gray-600 focus-visible:text-gray-900"
        :title="t('common.collection.removeFilter')"
        :aria-label="t('common.collection.removeFilter')"
        @click="emit('remove')"
      >
        <XMarkIcon class="size-4" />
      </button>
    </div>

    <PopoverPortal>
      <PopoverContent
        align="start"
        :side-offset="4"
        class="popover overlay-animated z-10 w-72 max-w-[calc(100vw-2rem)] space-y-3 p-3"
        @open-auto-focus="onOpenAutoFocus"
      >
        <FormField :label="t('common.collection.operator')">
          <FormSelect
            :model-value="props.criterion.operator"
            @update:model-value="onOperatorChange"
          >
            <option v-for="option in operatorOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </FormSelect>
        </FormField>

        <!-- `is_null` asks whether the row carries a value at all, so there is nothing to fill in. -->
        <div v-if="!valueless" ref="valueBox">
          <FormField :label="t('common.collection.value')">
            <CollectionFilterValue
              ref="value"
              :filter="props.filter"
              :criterion="props.criterion"
              @update="(patch) => emit('update', patch)"
              @submit="onOpenChange(false)"
            />
          </FormField>
        </div>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
