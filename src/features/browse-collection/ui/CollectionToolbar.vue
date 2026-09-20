<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/vue/20/solid'
import { CommonAlert, CommonButton, FormInput, secondaryColoredButton } from '@/shared/ui'
import type { Collection } from '../model/useCollection'
import CollectionFieldPicker from './CollectionFieldPicker.vue'
import CollectionFilterControl from './CollectionFilterControl.vue'

/**
 * What a collection is narrowed by: the free text field where it searches on something, the list of
 * the fields it filters on, and a control per criterion the caller has added — and, at the end of
 * the row, the control that reads the collection again. Every collection answers that last one, so
 * no page asks for it.
 *
 * Everything it offers comes from the capability document the collection published, so a deployment
 * that configured one more claim gets one more filter without this file knowing what a claim is.
 */
const props = defineProps<{
  collection: Collection<unknown>
  searchPlaceholder?: string
}>()

const { t } = useI18n()

// The criterion the field list just added, which is the one whose value the caller came to write.
// It is a criterion's own id because a field carries as many criteria as they add.
const addedFilterId = ref<number | null>(null)

const filters = computed(() => props.collection.filters)

function filterOf(field: string) {
  return filters.value.find((filter) => filter.field === field)
}

function onAddFilter(field: string) {
  addedFilterId.value = props.collection.addFilter(field) ?? null
}
</script>

<template>
  <div>
    <!-- One row at every width, and one gap down it: the field and the two controls beside it are
         all controls in a row, so nothing groups two of them more tightly than the third. They
         give up their labels rather than their place, since a second row costs the list below a
         record and the field beside them still reads. -->
    <div class="flex items-center gap-2">
      <!-- Bound to the criteria rather than left to the DOM: the store outlives the page, so a
           query still narrowing the collection would otherwise come back to an empty field. -->
      <FormInput
        v-if="props.collection.searchable"
        class="min-w-0 flex-1"
        :icon="MagnifyingGlassIcon"
        :model-value="props.collection.criteria.query"
        :placeholder="props.searchPlaceholder"
        :aria-label="props.searchPlaceholder || t('common.collection.search')"
        @update:model-value="props.collection.setSearch"
      />
      <!-- Holds the place the field would take, so the controls stay at the end of the row on a
           collection the server searches nothing on. -->
      <div v-else class="flex-1" />

      <CollectionFieldPicker v-if="filters.length > 0" :filters="filters" @select="onAddFilter" />

      <!-- A list can have moved on since it was drawn, whatever it holds, so re-reading it is the
           caller's without any page saying so. -->
      <CommonButton
        collapse-label
        class="shrink-0"
        :button-style="secondaryColoredButton"
        :label="t('common.collection.refresh')"
        :icon="ArrowPathIcon"
        :disabled="props.collection.loading"
        @click="props.collection.fetch(props.collection.page)"
      />
    </div>

    <!-- The records list without the document; what is missing is the toolbar above them. -->
    <CommonAlert v-if="props.collection.capabilitiesError" color="warning" class="mt-3">
      {{ t('common.collection.capabilitiesFailed') }}
    </CommonAlert>

    <!-- The one row the toolbar may grow: a filter is as wide as the sentence it reads, and a
         phone fits one of them. -->
    <div v-if="props.collection.criteria.filters.length > 0" class="mt-3 flex flex-wrap gap-2">
      <template v-for="criterion in props.collection.criteria.filters" :key="criterion.id">
        <CollectionFilterControl
          v-if="filterOf(criterion.field)"
          :filter="filterOf(criterion.field)!"
          :criterion="criterion"
          :open-on-mount="criterion.id === addedFilterId"
          @update="(patch) => props.collection.updateFilter(criterion.id, patch)"
          @remove="props.collection.removeFilter(criterion.id)"
        />
      </template>
    </div>
  </div>
</template>
