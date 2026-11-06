<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ClientApi, type ClientListResource, type ClientSummaryResource } from '@/entities/client'
import { CollectionPage, useCollection } from '@/features/browse-collection'
import { SaEmptyValue, SaTableCell, SaTableHeader } from '@sympauthy/design'
import { DocHelpTooltip, TableRecord } from '@/shared/ui'

const { t } = useI18n()
const api = new ClientApi()

const clients = useCollection<ClientSummaryResource, ClientListResource>({
  capabilities: () => api.getClientCapabilities(),
  page: (params) => api.listClients(params),
  items: (content) => content.clients
})

onMounted(async () => {
  await clients.load()
})
</script>

<template>
  <CollectionPage :collection="clients" :search-placeholder="t('pages.clients.search')">
    <template #header>
      <SaTableHeader
        :sorting="clients.sort"
        field="id"
        :filtered-label="clients.filteredLabel('id')"
      >
        {{ t('pages.clients.clientId') }}
      </SaTableHeader>
      <SaTableHeader fit>
        {{ t('pages.clients.type') }}
        <DocHelpTooltip term="terms.client.type" />
      </SaTableHeader>
      <SaTableHeader
        fit
        hidden-below="sm"
        :sorting="clients.sort"
        field="audience_id"
        :filtered-label="clients.filteredLabel('audience_id')"
      >
        {{ t('pages.clients.audience') }}
        <template #help>
          <DocHelpTooltip term="terms.audience.id" />
        </template>
      </SaTableHeader>
      <SaTableHeader>{{ t('pages.clients.redirectUris') }}</SaTableHeader>
    </template>

    <template #rows>
      <tr v-for="client in clients.items" :key="client.client_id">
        <SaTableCell primary mono>
          <TableRecord
            :name="client.client_id"
            :to="{ name: 'clientDetail', params: { clientId: client.client_id } }"
          />
        </SaTableCell>
        <SaTableCell :label="t('pages.clients.type')" fit>
          {{ client.type }}
        </SaTableCell>
        <SaTableCell :label="t('pages.clients.audience')" fit mono hidden-below="sm">
          {{ client.audience_id }}
        </SaTableCell>
        <SaTableCell :label="t('pages.clients.redirectUris')" mono>
          <template v-if="client.allowed_redirect_uris?.length">
            <div v-for="uri in client.allowed_redirect_uris" :key="uri" class="truncate">
              {{ uri }}
            </div>
          </template>
          <SaEmptyValue v-else />
        </SaTableCell>
      </tr>
    </template>

    <template #empty>
      <p class="text-sm text-gray-600">{{ t('pages.clients.empty') }}</p>
    </template>
  </CollectionPage>
</template>
