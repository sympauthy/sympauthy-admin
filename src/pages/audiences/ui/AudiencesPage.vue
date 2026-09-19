<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  AudienceApi,
  audienceRegistrationModeKey,
  audienceRegistrationModeColor,
  type AudienceListResource,
  type AudienceResource
} from '@/entities/audience'
import { CollectionPage, CollectionSortHeader, useCollection } from '@/features/browse-collection'
import { TableCell, TableHeader, Tag } from '@/shared/ui'

const { t } = useI18n()
const api = new AudienceApi()

const audiences = useCollection<AudienceResource, AudienceListResource>({
  capabilities: () => api.getAudienceCapabilities(),
  page: (params) => api.listAudiences(params),
  items: (content) => content.audiences
})

onMounted(async () => {
  await audiences.fetch()
})
</script>

<template>
  <CollectionPage :collection="audiences" :search-placeholder="t('pages.audiences.search')">
    <template #header>
      <CollectionSortHeader
        :collection="audiences"
        :label="t('pages.audiences.audienceId')"
        field="id"
      />
      <TableHeader fit hidden-below="sm">
        {{ t('common.audience.registrationMode.label') }}
      </TableHeader>
      <CollectionSortHeader
        fit
        hidden-below="sm"
        :collection="audiences"
        :label="t('pages.audiences.clientsCount')"
        field="client_count"
      />
    </template>

    <template #rows>
      <tr v-for="audience in audiences.items" :key="audience.audience_id">
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
