<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { MagnifyingGlassIcon } from '@heroicons/vue/20/solid'
import type { Collection } from '@/shared/collection'
import CollectionFilterChip from './CollectionFilterChip.vue'
import CommonAlert from './CommonAlert.vue'
import DropdownButton from './DropdownButton.vue'

/**
 * What a collection is narrowed by: the free text field where it searches on something, the menu of
 * the fields it filters on, and a chip per criterion the caller has added.
 *
 * Everything it offers comes from the capability document the collection published, so a deployment
 * that configured one more claim gets one more filter without this file knowing what a claim is.
 */
const props = defineProps<{
  collection: Collection<unknown>
  searchPlaceholder?: string
}>()

const { t } = useI18n()

// A field is offered as often as it admits a criterion: two chips over one date is how a range is
// asked for, so an already-filtered field stays in the menu.
const filterOptions = computed(() =>
  props.collection.filters.map((filter) => ({ label: filter.name, value: filter.field }))
)

function filterOf(field: string) {
  return props.collection.filters.find((filter) => filter.field === field)
}

function onSearchInput(event: Event) {
  props.collection.setSearch((event.target as HTMLInputElement).value)
}
</script>

<template>
  <div>
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <div v-if="props.collection.searchable" class="relative flex-1">
        <MagnifyingGlassIcon
          class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        />
        <!-- Bound to the criteria rather than left to the DOM: the store outlives the page, so a
             query still narrowing the collection would otherwise come back to an empty field. -->
        <input
          type="text"
          :value="props.collection.criteria.query"
          :placeholder="props.searchPlaceholder"
          :aria-label="props.searchPlaceholder || t('common.collection.search')"
          class="w-full rounded border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @input="onSearchInput"
        />
      </div>
      <DropdownButton
        v-if="filterOptions.length > 0"
        :label="t('common.addFilter')"
        :options="filterOptions"
        @select="props.collection.addFilter"
      />
    </div>

    <!-- The records list without the document; what is missing is the toolbar above them. -->
    <CommonAlert v-if="props.collection.capabilitiesError" color="warning" class="mt-3">
      {{ t('common.collection.capabilitiesFailed') }}
    </CommonAlert>

    <div v-if="props.collection.criteria.filters.length > 0" class="mt-3 flex flex-wrap gap-2">
      <template v-for="criterion in props.collection.criteria.filters" :key="criterion.id">
        <CollectionFilterChip
          v-if="filterOf(criterion.field)"
          :filter="filterOf(criterion.field)!"
          :criterion="criterion"
          @update="(patch) => props.collection.updateFilter(criterion.id, patch)"
          @remove="props.collection.removeFilter(criterion.id)"
        />
      </template>
    </div>
  </div>
</template>
