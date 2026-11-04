<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ClientApi, type ClientListResource, type ClientSummaryResource } from '@/entities/client'
import { CollectionPage, CollectionSortHeader, useCollection } from '@/features/browse-collection'
import { CommonButton, DocHelpTooltip, SaEmptyValue, SaTableCell, SaTableHeader } from '@/shared/ui'
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
      <SaTableHeader fit>
        {{ t('pages.clients.type') }}
        <DocHelpTooltip term="terms.client.type" />
      </SaTableHeader>
      <CollectionSortHeader
        fit
        hidden-below="sm"
        :collection="clients"
        :label="t('pages.clients.audience')"
        field="audience_id"
      >
        <template #help>
          <DocHelpTooltip term="terms.audience.id" />
        </template>
      </CollectionSortHeader>
      <SaTableHeader>{{ t('pages.clients.redirectUris') }}</SaTableHeader>
      <SaTableHeader fit>{{ t('pages.clients.actions') }}</SaTableHeader>
    </template>

    <template #rows>
      <tr v-for="client in clients.items" :key="client.client_id">
        <SaTableCell primary fit>
          {{ client.client_id }}
        </SaTableCell>
        <SaTableCell :label="t('pages.clients.type')" fit>
          {{ client.type }}
        </SaTableCell>
        <SaTableCell :label="t('pages.clients.audience')" fit hidden-below="sm">
          {{ client.audience_id }}
        </SaTableCell>
        <SaTableCell :label="t('pages.clients.redirectUris')">
          <template v-if="client.allowed_redirect_uris?.length">
            <div v-for="uri in client.allowed_redirect_uris" :key="uri" class="truncate">
              {{ uri }}
            </div>
          </template>
          <SaEmptyValue v-else />
        </SaTableCell>
        <SaTableCell fit>
          <CommonButton
            variant="secondary"
            :label="t('pages.clients.view')"
            :icon="EyeIcon"
            @click="router.push({ name: 'clientDetail', params: { clientId: client.client_id } })"
          />
        </SaTableCell>
      </tr>
    </template>

    <template #empty>
      <p class="text-sm text-gray-600">{{ t('pages.clients.empty') }}</p>
    </template>
  </CollectionPage>
</template>
