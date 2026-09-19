<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowPathIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/vue/20/solid'
import type { Collection } from '@/shared/collection'
import CollectionFilterChip from './CollectionFilterChip.vue'
import CommonAlert from './CommonAlert.vue'
import CommonButton from './CommonButton.vue'
import DropdownButton from './DropdownButton.vue'
import FormInput from './FormInput.vue'
import { secondaryColoredButton } from './ButtonStyle'

/**
 * What a collection is narrowed by: the free text field where it searches on something, the menu of
 * the fields it filters on, and a chip per criterion the caller has added — and, at the end of the
 * row, the control that reads the collection again. Every collection answers that last one, so no
 * page asks for it.
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
</script>

<template>
  <div>
    <div class="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
      <!-- Bound to the criteria rather than left to the DOM: the store outlives the page, so a
           query still narrowing the collection would otherwise come back to an empty field. -->
      <FormInput
        v-if="props.collection.searchable"
        class="w-full sm:flex-1"
        :icon="MagnifyingGlassIcon"
        :model-value="props.collection.criteria.query"
        :placeholder="props.searchPlaceholder"
        :aria-label="props.searchPlaceholder || t('common.collection.search')"
        @update:model-value="props.collection.setSearch"
      />
      <!-- Holds the place the field would take, so the controls stay at the end of the row on a
           collection the server searches nothing on. -->
      <div v-else class="hidden sm:block sm:flex-1" />

      <div class="flex items-center gap-2">
        <!-- A phone gives the row the width of one control, so both of them keep their icon and
             give up their label. -->
        <DropdownButton
          v-if="filterOptions.length > 0"
          collapse-label
          :label="t('common.addFilter')"
          :icon="PlusIcon"
          :options="filterOptions"
          @select="props.collection.addFilter"
        />
        <!-- A list can have moved on since it was drawn, whatever it holds, so re-reading it is
             the caller's without any page saying so. -->
        <CommonButton
          collapse-label
          :button-style="secondaryColoredButton"
          :label="t('common.collection.refresh')"
          :icon="ArrowPathIcon"
          :disabled="props.collection.loading"
          @click="props.collection.fetch(props.collection.page)"
        />
      </div>
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
