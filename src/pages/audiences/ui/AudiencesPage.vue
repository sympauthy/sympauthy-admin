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
import { CollectionPage, useCollection } from '@/features/browse-collection'
import { SaTableCell, SaTableHeader, SaTag } from '@sympauthy/design'
import { DocHelpTooltip } from '@/shared/ui'

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
      <SaTableHeader
        :sorting="audiences.sort"
        field="id"
        :filtered-label="audiences.filteredLabel('id')"
      >
        {{ t('pages.audiences.audienceId') }}
        <template #help>
          <DocHelpTooltip term="terms.audience.id" />
        </template>
      </SaTableHeader>
      <SaTableHeader fit hidden-below="sm">
        {{ t('terms.audience.registrationMode.label') }}
        <DocHelpTooltip term="terms.audience.registrationMode" />
      </SaTableHeader>
      <SaTableHeader
        fit
        hidden-below="sm"
        :sorting="audiences.sort"
        field="client_count"
        :filtered-label="audiences.filteredLabel('client_count')"
      >
        {{ t('pages.audiences.clientsCount') }}
      </SaTableHeader>
    </template>

    <template #rows>
      <tr v-for="audience in audiences.items" :key="audience.audience_id">
        <SaTableCell primary mono>
          {{ audience.audience_id }}
        </SaTableCell>
        <SaTableCell :label="t('terms.audience.registrationMode.label')" fit hidden-below="sm">
          <SaTag :color="audienceRegistrationModeColor(audience)">
            {{ t(audienceRegistrationModeKey(audience)) }}
          </SaTag>
        </SaTableCell>
        <SaTableCell :label="t('pages.audiences.clientsCount')" fit hidden-below="sm">
          {{ audience.clients_count }}
        </SaTableCell>
      </tr>
    </template>

    <template #empty>
      <p class="text-sm text-gray-600">{{ t('pages.audiences.empty') }}</p>
    </template>
  </CollectionPage>
</template>
