<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAudienceStore } from '@/stores/useAudienceStore'
import PaginatedTable from '@/components/PaginatedTable.vue'
import Tag from '@/components/Tag.vue'
import {
  audienceRegistrationModeKey,
  audienceRegistrationModeColor
} from '@/client/model/AudienceResource'

const { t } = useI18n()
const audienceStore = useAudienceStore()

onMounted(async () => {
  await audienceStore.fetchAudiences()
})
</script>

<template>
  <div>
    <PaginatedTable
      :loading="audienceStore.loading"
      :error="audienceStore.error"
      :empty="audienceStore.audiences.length === 0"
      :page="audienceStore.page"
      :total-pages="audienceStore.totalPages"
      @page-change="audienceStore.fetchAudiences"
    >
      <template #header>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.audiences.audienceId') }}
        </th>
        <th
          class="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-0 whitespace-nowrap"
        >
          {{ t('common.audience.registrationMode.label') }}
        </th>
        <th
          class="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-0 whitespace-nowrap"
        >
          {{ t('pages.audiences.clientsCount') }}
        </th>
      </template>

      <template #rows>
        <tr v-for="audience in audienceStore.audiences" :key="audience.audience_id">
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {{ audience.audience_id }}
          </td>
          <td class="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm">
            <Tag :color="audienceRegistrationModeColor(audience)">
              {{ t(audienceRegistrationModeKey(audience)) }}
            </Tag>
          </td>
          <td class="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ audience.clients_count }}
          </td>
        </tr>
      </template>

      <template #empty>
        <p class="text-gray-600">{{ t('pages.audiences.empty') }}</p>
      </template>
    </PaginatedTable>
  </div>
</template>
