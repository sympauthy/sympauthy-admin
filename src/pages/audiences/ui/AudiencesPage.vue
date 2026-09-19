<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  useAudienceStore,
  audienceRegistrationModeKey,
  audienceRegistrationModeColor
} from '@/entities/audience'
import { CollectionPage, CollectionSortHeader, TableCell, TableHeader, Tag } from '@/shared/ui'

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
      <TableHeader fit hidden-below="sm">
        {{ t('common.audience.registrationMode.label') }}
      </TableHeader>
      <CollectionSortHeader
        fit
        hidden-below="sm"
        :collection="audienceStore.audiences"
        :label="t('pages.audiences.clientsCount')"
        field="client_count"
      />
    </template>

    <template #rows>
      <tr v-for="audience in audienceStore.audiences.items" :key="audience.audience_id">
        <TableCell primary fit>
          {{ audience.audience_id }}
        </TableCell>
        <TableCell :label="t('common.audience.registrationMode.label')" fit hidden-below="sm">
          <Tag :color="audienceRegistrationModeColor(audience)">
            {{ t(audienceRegistrationModeKey(audience)) }}
          </Tag>
        </TableCell>
        <TableCell :label="t('pages.audiences.clientsCount')" fit hidden-below="sm">
          {{ audience.clients_count }}
        </TableCell>
      </tr>
    </template>

    <template #empty>
      <p class="text-sm text-gray-600">{{ t('pages.audiences.empty') }}</p>
    </template>
  </CollectionPage>
</template>
