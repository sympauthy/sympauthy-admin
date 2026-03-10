<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClaimStore } from '@/stores/useClaimStore'
import PaginatedTable from '@/components/PaginatedTable.vue'

const { t } = useI18n()
const claimStore = useClaimStore()

onMounted(async () => {
  await claimStore.fetchClaims()
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">{{ t('pages.claims.title') }}</h1>

    <PaginatedTable
      :loading="claimStore.loading"
      :error="claimStore.error"
      :empty="claimStore.claims.length === 0"
      :page="claimStore.page"
      :total-pages="claimStore.totalPages"
      @page-change="claimStore.fetchClaims"
    >
      <template #header>
        <th class="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.claims.status') }}
        </th>
        <th class="w-[30%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.claims.id') }}
        </th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.claims.tags') }}
        </th>
      </template>

      <template #rows>
        <tr v-for="claim in claimStore.claims" :key="claim.id">
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <span
              v-if="claim.enabled"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
            >
              {{ t('pages.claims.enabled') }}
            </span>
            <span
              v-else
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
            >
              {{ t('pages.claims.disabled') }}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {{ claim.id }}
          </td>
          <td class="px-6 py-4 text-sm text-gray-500">
            <span
              v-if="claim.standard"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-1"
            >
              {{ t('pages.claims.standard') }}
            </span>
            <span
              v-else
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mr-1"
            >
              {{ t('pages.claims.custom') }}
            </span>
            <span
              v-if="claim.required"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mr-1"
            >
              {{ t('pages.claims.required') }}
            </span>
            <span
              v-if="claim.identifier"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800"
            >
              {{ t('pages.claims.identifier') }}
            </span>
          </td>
        </tr>
      </template>

      <template #empty>
        <p class="text-gray-600">{{ t('pages.claims.empty') }}</p>
      </template>
    </PaginatedTable>
  </div>
</template>
