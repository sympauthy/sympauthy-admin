<script lang="ts" setup>
import { computed, useSlots } from 'vue'
import FilterBar from '@/components/FilterBar.vue'
import PaginatedTable from '@/components/PaginatedTable.vue'
import type { FilterConfig } from '@/components/FilterBar.vue'

/**
 * Layout shared by every resource list page: a toolbar holding the search bar, the filters and the
 * page actions, then a table filling the remaining height. The number of rows requested per page is
 * derived from that height, so a page never scrolls as a whole.
 */
const props = withDefaults(
  defineProps<{
    loading?: boolean
    error?: string | null
    empty?: boolean
    page?: number
    size?: number
    total?: number
    totalPages?: number
    /** Only set it on resources whose list endpoint supports a free text query. */
    searchable?: boolean
    searchPlaceholder?: string
    filters?: FilterConfig[]
    minPageSize?: number
  }>(),
  {
    loading: false,
    error: null,
    empty: false,
    page: 0,
    size: 0,
    total: 0,
    totalPages: 1,
    searchable: false,
    searchPlaceholder: '',
    filters: () => [],
    minPageSize: 5
  }
)

const emit = defineEmits<{
  search: [query: string]
  filterChange: [key: string, value: string]
  filterRemove: [key: string]
  pageChange: [page: number]
  pageSizeChange: [size: number]
}>()

const slots = useSlots()

const hasFilterBar = computed(() => props.searchable || props.filters.length > 0)
const hasToolbar = computed(() => hasFilterBar.value || slots.actions !== undefined)
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <div
      v-if="hasToolbar"
      class="mb-4 flex shrink-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
    >
      <FilterBar
        v-if="hasFilterBar"
        class="min-w-0 flex-1"
        :searchable="props.searchable"
        :search-placeholder="props.searchPlaceholder"
        :filters="props.filters"
        @search="emit('search', $event)"
        @filter-change="(key, value) => emit('filterChange', key, value)"
        @filter-remove="emit('filterRemove', $event)"
      />
      <div v-if="slots.actions" class="flex shrink-0 items-center gap-2">
        <slot name="actions" />
      </div>
    </div>

    <PaginatedTable
      class="min-h-0 flex-1"
      fill
      auto-page-size
      :loading="props.loading"
      :error="props.error"
      :empty="props.empty"
      :page="props.page"
      :size="props.size"
      :total="props.total"
      :total-pages="props.totalPages"
      :min-page-size="props.minPageSize"
      @page-change="emit('pageChange', $event)"
      @page-size-change="emit('pageSizeChange', $event)"
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
    </PaginatedTable>
  </div>
</template>
