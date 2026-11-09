<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ClientApi,
  clientTypeLabel,
  type ClientListResource,
  type ClientSummaryResource
} from '@/entities/client'
import { CollectionPage, useCollection } from '@/features/browse-collection'
import { SaEmptyValue, SaTableCell, SaTableHeader } from '@sympauthy/design'
import { DocHelpTooltip, TableRecord } from '@/shared/ui'

const { t } = useI18n()
const api = new ClientApi()

const clients = useCollection<ClientSummaryResource, ClientListResource>({
  capabilities: () => api.getClientCapabilities(),
  page: (params) => api.listClients(params),
  items: (content) => content.clients,
  key: (client) => client.client_id
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
        {{ t('pages.clients.client') }}
      </SaTableHeader>
      <SaTableHeader fit>
        {{ t('pages.clients.type') }}
        <DocHelpTooltip term="terms.client.type" />
      </SaTableHeader>
      <SaTableHeader
        fit
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
        <SaTableCell primary mono truncate>
          <TableRecord
            :name="client.client_id"
            :to="{ name: 'clientDetail', params: { clientId: client.client_id } }"
          />
        </SaTableCell>
        <SaTableCell :label="t('pages.clients.type')" fit>
          {{ clientTypeLabel(client.type) }}
        </SaTableCell>
        <!-- A phone reads the audience and the redirect URIs each on a line of their own, as the
             canvas lists them under the type. The package ends that phone's first line with a break
             that the row's gap falls on both sides of, so each line after it adds that gap again to
             read evenly spaced. -->
        <SaTableCell
          :label="t('pages.clients.audience')"
          fit
          mono
          class="max-sm:mt-1 max-sm:basis-full"
        >
          {{ client.audience_id }}
        </SaTableCell>
        <!-- The first URI stands for the rest, which are counted beside it and read in full on the
             record: a row as tall as its longest list would leave a page of clients a few rows long. -->
        <SaTableCell
          :label="t('pages.clients.redirectUris')"
          truncate
          mono
          class="max-sm:mt-1 max-sm:basis-full"
        >
          <span
            v-if="client.allowed_redirect_uris?.length"
            class="flex min-w-0 items-baseline gap-2"
            :title="client.allowed_redirect_uris.join('\n')"
          >
            <span class="truncate">{{ client.allowed_redirect_uris[0] }}</span>
            <span
              v-if="client.allowed_redirect_uris.length > 1"
              class="shrink-0 font-sans text-xs text-gray-500"
            >
              <span class="hidden sm:inline">
                {{
                  t('pages.clients.moreRedirectUris', {
                    n: client.allowed_redirect_uris.length - 1
                  })
                }}
              </span>
              <span class="sm:hidden">
                {{
                  t('pages.clients.moreRedirectUrisShort', {
                    n: client.allowed_redirect_uris.length - 1
                  })
                }}
              </span>
            </span>
          </span>
          <SaEmptyValue v-else />
        </SaTableCell>
      </tr>
    </template>

    <template #empty>
      <p class="max-w-prose text-center text-sm text-gray-600">{{ t('pages.clients.empty') }}</p>
    </template>
  </CollectionPage>
</template>
