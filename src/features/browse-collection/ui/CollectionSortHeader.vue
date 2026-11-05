<script lang="ts" setup>
import { computed, useSlots } from 'vue'
import { useI18n } from 'vue-i18n'
import { SaTableHeader } from '@sympauthy/design'
import type { Collection } from '../model/useCollection'

/**
 * A column header of a collection, which orders it where the collection says it orders on that field
 * and says so where a filter narrows it.
 *
 * Whether the column is sortable is read from the capability document rather than passed in, so a
 * page hands every column through here and the ones the server cannot order on draw as a plain
 * header. The label stays the page's own string: the document names a filter and a sort key, not a
 * column.
 */
const props = withDefaults(
  defineProps<{
    collection: Collection<unknown>
    label: string
    field: string
    /** Takes only the width its content needs. Forwarded to the header it draws. */
    fit?: boolean
    /** Dropped below this width. Forwarded to the header it draws. */
    hiddenBelow?: 'sm' | 'lg'
  }>(),
  {
    fit: false,
    hiddenBelow: undefined
  }
)

const slots = useSlots()
const { t } = useI18n()

const filteredLabel = computed(() =>
  props.collection.filters.isFiltered(props.field) ? t('common.collection.filtered') : undefined
)
</script>

<template>
  <SaTableHeader
    :fit="props.fit"
    :hidden-below="props.hiddenBelow"
    :sorting="props.collection.sort"
    :field="props.field"
    :filtered-label="filteredLabel"
  >
    {{ props.label }}
    <template v-if="slots.help" #help>
      <slot name="help" />
    </template>
  </SaTableHeader>
</template>
