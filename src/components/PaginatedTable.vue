<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import CommonSpinner from '@/components/CommonSpinner.vue'
import CommonAlert from '@/components/CommonAlert.vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    loading?: boolean
    error?: string | null
    empty?: boolean
    page?: number
    totalPages?: number
    tableLayout?: 'fixed' | 'auto'
  }>(),
  {
    loading: false,
    error: null,
    empty: false,
    page: 0,
    totalPages: 1,
    tableLayout: 'fixed',
  },
)

const emit = defineEmits<{
  pageChange: [page: number]
}>()

function previousPage() {
  if (props.page > 0) {
    emit('pageChange', props.page - 1)
  }
}

function nextPage() {
  if (props.page < props.totalPages - 1) {
    emit('pageChange', props.page + 1)
  }
}
</script>

<template>
  <!-- Loading state -->
  <div v-if="props.loading" class="flex items-center gap-2">
    <CommonSpinner class="h-6 w-6 border-4" />
    <span class="text-gray-600">{{ t('common.loading') }}</span>
  </div>

  <!-- Error state -->
  <CommonAlert v-else-if="props.error" color="danger">
    {{ props.error }}
  </CommonAlert>

  <!-- Empty state -->
  <div v-else-if="props.empty">
    <slot name="empty" />
  </div>

  <!-- Table -->
  <div v-else>
    <div class="overflow-x-auto">
      <table class="w-full divide-y divide-gray-200" :class="props.tableLayout === 'auto' ? 'table-auto' : 'table-fixed'">
        <thead class="bg-gray-50">
          <tr>
            <slot name="header" />
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <slot name="rows" />
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="props.totalPages > 1" class="flex items-center justify-between mt-4">
      <span class="text-sm text-gray-600">
        {{ t('common.pagination', { page: props.page + 1, totalPages: props.totalPages }) }}
      </span>
      <div class="flex gap-2">
        <button
          :disabled="props.page === 0"
          class="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="previousPage"
        >
          <ChevronLeftIcon class="h-4 w-4 mr-1" />
          {{ t('common.previous') }}
        </button>
        <button
          :disabled="props.page >= props.totalPages - 1"
          class="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="nextPage"
        >
          {{ t('common.next') }}
          <ChevronRightIcon class="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  </div>
</template>
