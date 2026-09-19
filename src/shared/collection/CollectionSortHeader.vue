<script lang="ts" setup>
import { computed } from 'vue'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/vue/20/solid'
import { TableHeader } from '@/shared/ui'
import type { Collection } from './useCollection'

/**
 * A column header, which the caller can order the collection on where the collection says it orders
 * on that field.
 *
 * Whether the column is sortable is read from the capability document rather than passed in, so a
 * page hands every column through here and the ones the server cannot order on simply do not
 * respond to a click. The label stays the page's own string: the document names a filter and a sort
 * key, not a column.
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

const sortable = computed(() => props.collection.sortsOn(props.field))

// The arrow follows the order the collection actually reads in, which is the collection's own until
// the caller names a key — so the column a list arrives sorted on says so before anything is
// clicked.
const key = computed(() => props.collection.sortKeys.find((sort) => sort.field === props.field))

function onClick() {
  if (sortable.value) {
    props.collection.toggleSort(props.field)
  }
}
</script>

<template>
  <TableHeader
    :fit="props.fit"
    :hidden-below="props.hiddenBelow"
    :class="sortable ? 'cursor-pointer select-none hover:bg-gray-100' : ''"
    :aria-sort="key ? (key.descending ? 'descending' : 'ascending') : undefined"
    @click="onClick"
  >
    <span class="inline-flex items-center gap-1">
      {{ props.label }}
      <!-- An icon matches the text it sits in, and a column's label is the one `text-xs` on a
           screen. -->
      <ChevronUpIcon v-if="key && !key.descending" class="size-3" />
      <ChevronDownIcon v-else-if="key" class="size-3" />
    </span>
  </TableHeader>
</template>
