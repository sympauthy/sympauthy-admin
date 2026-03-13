<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClaimStore } from '@/stores/useClaimStore'
import PaginatedTable from '@/components/PaginatedTable.vue'
import Tag from '@/components/Tag.vue'
import IdentifierHelpTooltip from '@/components/IdentifierHelpTooltip.vue'

const { t } = useI18n()
const claimStore = useClaimStore()

onMounted(async () => {
  await claimStore.fetchClaims()
})
</script>

<template>
  <div>
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
            <Tag v-if="claim.enabled" color="green">
              {{ t('pages.claims.enabled') }}
            </Tag>
            <Tag v-else color="red">
              {{ t('pages.claims.disabled') }}
            </Tag>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {{ claim.id }}
          </td>
          <td class="px-6 py-4 text-sm text-gray-500">
            <Tag v-if="claim.standard" color="blue" class="mr-1">
              {{ t('pages.claims.standard') }}
            </Tag>
            <Tag v-else color="gray" class="mr-1">
              {{ t('pages.claims.custom') }}
            </Tag>
            <Tag v-if="claim.required" color="purple" class="mr-1">
              {{ t('pages.claims.required') }}
            </Tag>
            <Tag v-if="claim.identifier" color="yellow">
              {{ t('pages.claims.identifier') }}
              <template #help>
                <IdentifierHelpTooltip />
              </template>
            </Tag>
          </td>
        </tr>
      </template>

      <template #empty>
        <p class="text-gray-600">{{ t('pages.claims.empty') }}</p>
      </template>
    </PaginatedTable>
  </div>
</template>