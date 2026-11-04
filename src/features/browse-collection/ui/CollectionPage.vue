<script lang="ts" setup>
import { useSlots } from 'vue'
import { useI18n } from 'vue-i18n'
import { SaPagination, SaTable } from '@sympauthy/design'
import type { Collection } from '../model/useCollection'
import CollectionToolbar from './CollectionToolbar.vue'

/**
 * The root of a page showing one collection: a toolbar holding the search field, the filters and
 * the page's actions, then a table filling the remaining height. The number of rows requested per
 * page is derived from that height, so a page never scrolls as a whole.
 *
 * Everything but the columns comes from the collection it is handed — the toolbar from the
 * capability document, the paging and the order from what the caller asked. The page writes its
 * `header` and `rows` slots and nothing else; what the page lets an operator do is a `SaPageActions`,
 * which puts it in the bar naming the screen rather than in the row narrowing the list.
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
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <CollectionToolbar
      class="mb-4 shrink-0"
      :collection="props.collection"
      :search-placeholder="props.searchPlaceholder"
    />

    <!-- What the page could not draw, above what it could. The toolbar says the same of a capability
         document it failed to read; this is for whatever else the page needed and did not get. -->
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
