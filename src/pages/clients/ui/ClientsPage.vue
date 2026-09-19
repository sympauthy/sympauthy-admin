<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  ClientApi,
  ClientTypeHelpTooltip,
  type ClientListResource,
  type ClientSummaryResource
} from '@/entities/client'
import { CollectionPage, CollectionSortHeader, useCollection } from '@/features/browse-collection'
import { CommonButton, EmptyValue, TableCell, TableHeader, primaryColoredButton } from '@/shared/ui'
import { EyeIcon } from '@heroicons/vue/20/solid'

const { t } = useI18n()
const router = useRouter()
const api = new ClientApi()

const clients = useCollection<ClientSummaryResource, ClientListResource>({
  capabilities: () => api.getClientCapabilities(),
  page: (params) => api.listClients(params),
  items: (content) => content.clients
})

onMounted(async () => {
  await clients.fetch()
})
</script>

<template>
  <CollectionPage :collection="clients" :search-placeholder="t('pages.clients.search')">
    <template #header>
      <CollectionSortHeader
        fit
        :collection="clients"
        :label="t('pages.clients.clientId')"
        field="id"
      />
      <TableHeader fit>
        {{ t('pages.clients.type') }}
        <ClientTypeHelpTooltip />
      </TableHeader>
      <CollectionSortHeader
        fit
        hidden-below="sm"
        :collection="clients"
        :label="t('pages.clients.audience')"
        field="audience_id"
      />
      <TableHeader>{{ t('pages.clients.redirectUris') }}</TableHeader>
      <TableHeader fit>{{ t('pages.clients.actions') }}</TableHeader>
    </template>

    <template #rows>
      <tr v-for="client in clients.items" :key="client.client_id">
        <TableCell primary fit>
          {{ client.client_id }}
        </TableCell>
        <TableCell :label="t('pages.clients.type')" fit>
          {{ client.type }}
        </TableCell>
        <TableCell :label="t('pages.clients.audience')" fit hidden-below="sm">
          {{ client.audience_id }}
        </TableCell>
        <TableCell :label="t('pages.clients.redirectUris')">
          <template v-if="client.allowed_redirect_uris?.length">
            <div v-for="uri in client.allowed_redirect_uris" :key="uri" class="truncate">
              {{ uri }}
            </div>
          </template>
          <EmptyValue v-else />
        </TableCell>
        <TableCell fit>
          <CommonButton
            :button-style="primaryColoredButton"
            :label="t('pages.clients.view')"
            :icon="EyeIcon"
            @click="router.push({ name: 'clientDetail', params: { clientId: client.client_id } })"
          />
        </TableCell>
      </tr>
    </template>

    <template #empty>
      <p class="text-sm text-gray-600">{{ t('pages.clients.empty') }}</p>
    </template>
  </CollectionPage>
</template>
