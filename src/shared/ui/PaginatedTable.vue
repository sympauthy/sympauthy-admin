<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import CommonAlert from './CommonAlert.vue'
import LoadingState from './LoadingState.vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/20/solid'
import {
  PaginationRoot,
  PaginationList,
  PaginationListItem,
  PaginationPrev,
  PaginationNext,
  PaginationEllipsis
} from 'reka-ui'
import { useAutoPageSize } from '@/shared/lib'

const { t } = useI18n()
const props = withDefaults(
  defineProps<{
    loading?: boolean
    error?: string | null
    empty?: boolean
    page?: number
    size?: number
    total?: number
    totalPages?: number
    tableLayout?: 'fixed' | 'auto'
    /**
     * Fills the height of the parent: rows scroll inside the table while the header row and the
     * pagination bar stay pinned. The parent must have a height set by the layout.
     */
    fill?: boolean
    /** Derives the number of rows per page from the height available in `fill` mode. */
    autoPageSize?: boolean
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
    tableLayout: 'auto',
    fill: false,
    autoPageSize: false,
    minPageSize: 1
  }
)

const emit = defineEmits<{
  pageChange: [page: number]
  pageSizeChange: [size: number]
}>()

const viewport = ref<HTMLElement | null>(null)

useAutoPageSize(viewport, {
  enabled: () => props.fill && props.autoPageSize,
  minSize: props.minPageSize,
  onChange: (size) => emit('pageSizeChange', size)
})

// Kept visible in fill mode even for a single page: hiding it would give the rows more room, which
// in turn feeds back into the number of rows per page.
const showPagination = computed(() => props.fill || props.totalPages > 1)

// Range of items displayed, when the page knows both its size and the total number of items.
const range = computed(() => {
  if (props.size <= 0 || props.total <= 0 || props.empty) {
    return null
  }
  return {
    from: props.page * props.size + 1,
    to: Math.min((props.page + 1) * props.size, props.total),
    total: props.total
  }
})

// reka-ui derives the page count from the item counts. A caller that only knows how many pages it
// has (no `size`/`total`) maps one item to one page, which gives back the same count.
const itemsPerPage = computed(() => (props.size > 0 ? props.size : 1))
const totalItems = computed(() => (props.size > 0 ? props.total : props.totalPages))

// The bar under a table is its own scale: every control on it is one row of `text-sm` tall, which
// is a step under the controls above the table rather than the same height as them.
const pageControlClasses =
  'inline-flex h-8 items-center justify-center rounded-md border border-gray-300 px-3 text-sm text-gray-700 hover:bg-gray-50'
const navButtonClasses = `${pageControlClasses} disabled:cursor-not-allowed disabled:opacity-50`
const pageButtonClasses = `${pageControlClasses} min-w-8 data-[selected]:border-transparent data-[selected]:bg-primary data-[selected]:text-on-primary`
</script>

<template>
  <div :class="props.fill ? 'flex h-full min-h-0 flex-col' : ''">
    <div
      ref="viewport"
      :class="props.fill ? 'min-h-0 flex-1 overflow-x-auto overflow-y-auto' : 'overflow-x-auto'"
    >
      <!-- Loading state -->
      <LoadingState v-if="props.loading" :centered="props.fill" />

      <!-- Error state -->
      <CommonAlert v-else-if="props.error" color="danger">
        {{ props.error }}
      </CommonAlert>

      <!-- Empty state -->
      <div
        v-else-if="props.empty"
        :class="props.fill ? 'flex h-full items-center justify-center' : ''"
      >
        <slot name="empty" />
      </div>

      <!-- Table -->
      <table
        v-else
        class="table-as-cards w-full divide-y divide-gray-200"
        :class="[
          props.tableLayout === 'auto' ? 'table-auto' : 'table-fixed',
          props.fill ? 'table-pinned-header' : ''
        ]"
      >
        <thead class="bg-gray-50">
          <tr>
            <slot name="header" />
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <slot name="rows" />
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <PaginationRoot
      v-if="showPagination"
      :page="props.page + 1"
      :items-per-page="itemsPerPage"
      :total="totalItems"
      :sibling-count="1"
      show-edges
      class="mt-4 flex shrink-0 items-center justify-center gap-2 sm:justify-between"
      @update:page="(value: number) => emit('pageChange', value - 1)"
    >
      <!-- A phone is told which page of how many by the indicator inside the pager, so the range
           it also reads would cost the list a record to say the same thing twice. -->
      <span class="hidden text-sm text-gray-600 sm:inline">
        <template v-if="range">
          {{ t('common.paginationRange', range) }}
        </template>
      </span>

      <PaginationList v-slot="{ items }" class="flex items-center gap-1">
        <PaginationPrev :class="navButtonClasses">
          <ChevronLeftIcon class="size-4 sm:mr-1" />
          <span class="hidden sm:inline">{{ t('common.previous') }}</span>
        </PaginationPrev>

        <!-- Page numbers do not fit a phone: they are replaced by the page indicator. -->
        <span class="px-2 text-sm text-gray-600 sm:hidden">
          {{ t('common.pagination', { page: props.page + 1, totalPages: props.totalPages }) }}
        </span>

        <div class="hidden items-center gap-1 sm:flex">
          <template v-for="(item, index) in items">
            <PaginationListItem
              v-if="item.type === 'page'"
              :key="`page-${item.value}`"
              :value="item.value"
              :class="pageButtonClasses"
            />
            <PaginationEllipsis
              v-else
              :key="`ellipsis-${index}`"
              class="inline-flex h-8 min-w-8 items-center justify-center pb-1.5 text-sm leading-none text-gray-500"
            >
              &hellip;
            </PaginationEllipsis>
          </template>
        </div>

        <PaginationNext :class="navButtonClasses">
          <span class="hidden sm:inline">{{ t('common.next') }}</span>
          <ChevronRightIcon class="size-4 sm:ml-1" />
        </PaginationNext>
      </PaginationList>
    </PaginationRoot>
  </div>
</template>
