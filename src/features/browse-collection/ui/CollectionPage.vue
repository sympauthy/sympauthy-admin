<script lang="ts" setup>
import { useSlots } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/vue/20/solid'
import {
  SaAlert,
  SaInput,
  SaPagination,
  SaTable,
  SaTableFilterPicker,
  SaTableFilters,
  SaTableSort
} from '@sympauthy/design'
import { CommonButton } from '@/shared/ui'
import { useCollectionLabels } from '../model/useCollectionLabels'
import type { Collection } from '../model/useCollection'

/**
 * The root of a page showing one collection: one card holding what narrows it, its rows and its
 * pages, filling the remaining height. The number of rows requested per page is derived from that
 * height, so a page never scrolls as a whole.
 *
 * Everything but the columns comes from the collection it is handed: what can be searched, filtered
 * and ordered from the capability document, the paging and the order from what the caller asked. The
 * page writes its `header` and `rows` slots and nothing else; what the page lets an operator do is a
 * `SaPageActions`, which puts it in the bar naming the screen rather than in the row narrowing the
 * list.
 */
const props = withDefaults(
  defineProps<{
    collection: Collection<unknown>
    /** Shown in the search field, where the collection searches on something. */
    searchPlaceholder?: string
    minPageSize?: number
  }>(),
  {
    searchPlaceholder: '',
    minPageSize: 1
  }
)

const slots = useSlots()
const { t } = useI18n()
const labels = useCollectionLabels()
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <!-- The records list without the document; what is missing is what narrows them. -->
    <SaAlert v-if="props.collection.capabilitiesError" color="warning" class="mb-4 shrink-0">
      {{ t('common.collection.capabilitiesFailed') }}
    </SaAlert>

    <!-- What the page could not draw, above what it could. -->
    <div v-if="slots.notice" class="mb-4 shrink-0">
      <slot name="notice" />
    </div>

    <SaTable
      class="min-h-0 flex-1"
      fill
      auto-page-size
      :loading-label="t('common.loading')"
      :loading="props.collection.loading"
      :error="props.collection.error"
      :empty="props.collection.items.length === 0"
      :min-page-size="props.minPageSize"
      @page-size-change="props.collection.setSize"
    >
      <template #toolbar>
        <!-- Bound to the collection rather than left to the DOM: the store outlives the page, so a
             query still narrowing the collection would otherwise come back to an empty field. -->
        <SaInput
          v-if="props.collection.searchable"
          class="min-w-0 flex-1 basis-60"
          :icon="MagnifyingGlassIcon"
          :model-value="props.collection.query"
          :placeholder="props.searchPlaceholder"
          :aria-label="props.searchPlaceholder || t('common.collection.search')"
          @update:model-value="props.collection.setSearch"
        />
        <!-- Holds the place the field would take, so the controls stay at the end of the row on a
             collection the server searches nothing on. A phone's controls fill theirs. -->
        <div v-else class="hidden flex-1 sm:block" />

        <SaTableFilterPicker :filters="props.collection.filters" :labels="labels.filters.value" />
        <SaTableSort :sort="props.collection.sort" :labels="labels.sort.value" />

        <!-- A list can have moved on since it was drawn, whatever it holds, so re-reading it is the
             caller's without any page saying so. -->
        <CommonButton
          collapse-label
          class="shrink-0"
          variant="secondary"
          :label="t('common.collection.refresh')"
          :icon="ArrowPathIcon"
          :disabled="props.collection.loading"
          @click="props.collection.fetch(props.collection.page)"
        />
      </template>
      <template #filters>
        <SaTableFilters :filters="props.collection.filters" :labels="labels.filters.value">
          <!-- The count of the last answer, which says nothing of a request that was refused. -->
          <template v-if="!props.collection.error" #summary>
            {{
              t(
                'common.collection.matches',
                { total: props.collection.total },
                props.collection.total
              )
            }}
          </template>
        </SaTableFilters>
      </template>
      <template #header>
        <slot name="header" />
      </template>
      <template #rows>
        <slot name="rows" />
      </template>
      <template #empty>
        <slot name="empty" />
      </template>
      <!-- Kept on screen for a single page: hiding it would give the rows more room, which in turn
           feeds back into the number of rows per page. -->
      <template #footer>
        <SaPagination
          always-shown
          :page="props.collection.page"
          :total-pages="props.collection.totalPages"
          :size="props.collection.size"
          :total="props.collection.total"
          :label="t('common.paginationLabel')"
          :previous-label="t('common.previous')"
          :next-label="t('common.next')"
          :page-label="(page, totalPages) => t('common.pagination', { page, totalPages })"
          :range-label="(range) => t('common.paginationRange', range)"
          @page-change="props.collection.fetch"
        />
      </template>
    </SaTable>
  </div>
</template>
