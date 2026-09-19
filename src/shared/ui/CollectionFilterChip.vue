<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { XMarkIcon } from '@heroicons/vue/20/solid'
import {
  collectionOperatorLabelKey,
  isMultiValuedOperator,
  isValuelessOperator,
  type CollectionCriterion,
  type CollectionFilter,
  type CollectionOperator
} from '@/shared/collection'

/**
 * One criterion of a collection: the field it names, the operator it asks under, and the value the
 * two are asked of.
 *
 * The control the value is given is decided by the field's type, and by the values the field
 * publishes where its set is closed. A field may carry more than one chip — that is how a range is
 * asked for — so a chip is addressed by the criterion's own id and not by its field.
 */
const props = defineProps<{
  filter: CollectionFilter
  criterion: CollectionCriterion
}>()

const emit = defineEmits<{
  update: [patch: Partial<Omit<CollectionCriterion, 'id'>>]
  remove: []
}>()

const { t } = useI18n()

const operatorOptions = computed(() =>
  props.filter.operators.map((operator) => ({
    value: operator,
    label: t(collectionOperatorLabelKey(operator, props.filter.type))
  }))
)

const valueless = computed(() => isValuelessOperator(props.criterion.operator))
const multiValued = computed(() => isMultiValuedOperator(props.criterion.operator))

// `select multiple` is the one control whose value is not a string, so it is bound rather than
// read off the event: setting `value` on the element cannot express a selection of several, and
// patching it would clear the whole list the moment a second option was picked.
const selectedValues = computed({
  get: () => props.criterion.values,
  set: (values: string[]) => emit('update', { values })
})
// A field publishing its values is rendered as a choice among them whatever its type: the set is
// this deployment's, and a caller typing a value it does not hold is answered with a 400.
const closedSet = computed(() => (props.filter.values?.length ?? 0) > 0)

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

function onOperatorChange(event: Event) {
  const operator = (event.target as HTMLSelectElement).value as CollectionOperator
  // The value is cleared with the operator: `in` holds a list where the others hold one value, and
  // `is_null` holds neither, so carrying one across would ask the new operator the old question.
  emit('update', { operator, value: '', values: [] })
}

function onValueChange(event: Event) {
  emit('update', { value: (event.target as HTMLInputElement | HTMLSelectElement).value })
}

/**
 * Reads an `in` over a field that publishes no values, where the caller types the list themselves.
 *
 * The separator is the comma the grammar joins them back with, which is also why no field whose
 * values may hold one admits `in`.
 */
function onTypedValuesChange(event: Event) {
  const typed = (event.target as HTMLInputElement).value
  emit('update', {
    values: typed
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value !== '')
  })
}

const selectClasses = 'border-none bg-white py-0 pl-1 pr-6 text-sm focus:outline-none focus:ring-0'
const inputClasses = 'w-28 border-none bg-white px-1 py-0 text-sm focus:outline-none focus:ring-0'
</script>

<template>
  <div
    class="flex items-center gap-1 rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-sm"
  >
    <span class="font-medium text-gray-600">{{ props.filter.name }}</span>

    <select
      :class="selectClasses"
      :value="props.criterion.operator"
      :aria-label="t('common.collection.operator')"
      @change="onOperatorChange"
    >
      <option v-for="option in operatorOptions" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>

    <!-- `is_null` asks whether the row carries a value at all, so there is nothing to fill in. -->
    <template v-if="!valueless">
      <select
        v-if="closedSet && multiValued"
        v-model="selectedValues"
        multiple
        :class="selectClasses"
        :aria-label="props.filter.name"
      >
        <option v-for="value in props.filter.values" :key="value.value" :value="value.value">
          {{ value.name }}
        </option>
      </select>

      <select
        v-else-if="closedSet"
        :class="selectClasses"
        :value="props.criterion.value"
        :aria-label="props.filter.name"
        @change="onValueChange"
      >
        <option value="">{{ t('common.collection.selectValue') }}</option>
        <option v-for="value in props.filter.values" :key="value.value" :value="value.value">
          {{ value.name }}
        </option>
      </select>

      <select
        v-else-if="props.filter.type === 'boolean'"
        :class="selectClasses"
        :value="props.criterion.value"
        :aria-label="props.filter.name"
        @change="onValueChange"
      >
        <option value="">{{ t('common.collection.selectValue') }}</option>
        <option value="true">{{ t('common.yes') }}</option>
        <option value="false">{{ t('common.no') }}</option>
      </select>

      <input
        v-else-if="multiValued"
        type="text"
        :class="inputClasses"
        :value="props.criterion.values.join(', ')"
        :aria-label="props.filter.name"
        :placeholder="t('common.collection.valueList')"
        @input="onTypedValuesChange"
      />

      <input
        v-else
        :type="inputType"
        :class="inputClasses"
        :value="props.criterion.value"
        :aria-label="props.filter.name"
        @input="onValueChange"
      />
    </template>

    <button
      class="text-gray-400 hover:text-gray-600"
      :title="t('common.collection.removeFilter')"
      :aria-label="t('common.collection.removeFilter')"
      @click="emit('remove')"
    >
      <XMarkIcon class="h-4 w-4" />
    </button>
  </div>
</template>
