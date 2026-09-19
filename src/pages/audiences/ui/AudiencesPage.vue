<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  useAudienceStore,
  audienceRegistrationModeKey,
  audienceRegistrationModeColor
} from '@/entities/audience'
import { CollectionPage, CollectionSortHeader, Tag } from '@/shared/ui'

const { t } = useI18n()
const audienceStore = useAudienceStore()

onMounted(async () => {
  await audienceStore.audiences.fetch()
})
</script>

<template>
  <CollectionPage
    :collection="audienceStore.audiences"
    :search-placeholder="t('pages.audiences.search')"
  >
    <template #header>
      <CollectionSortHeader
        :collection="audienceStore.audiences"
        :label="t('pages.audiences.audienceId')"
        field="id"
      />
      <th
        class="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-0 whitespace-nowrap"
      >
        {{ t('common.audience.registrationMode.label') }}
      </th>
      <CollectionSortHeader
        class="hidden sm:table-cell w-0 whitespace-nowrap"
        :collection="audienceStore.audiences"
        :label="t('pages.audiences.clientsCount')"
        field="client_count"
      />
    </template>

    <template #rows>
      <tr v-for="audience in audienceStore.audiences.items" :key="audience.audience_id">
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
  </CollectionPage>
</template>
