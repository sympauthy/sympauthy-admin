<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useClientStore, ClientTypeHelpTooltip } from '@/entities/client'
import {
  CollectionPage,
  CollectionSortHeader,
  CommonButton,
  TableCell,
  TableHeader,
  primaryColoredButton
} from '@/shared/ui'
import { EyeIcon } from '@heroicons/vue/20/solid'

const { t } = useI18n()
const router = useRouter()
const clientStore = useClientStore()

onMounted(async () => {
  await clientStore.clients.fetch()
})
</script>

<template>
  <CollectionPage :collection="clientStore.clients" :search-placeholder="t('pages.clients.search')">
    <template #header>
      <CollectionSortHeader
        fit
        :collection="clientStore.clients"
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
        :collection="clientStore.clients"
        :label="t('pages.clients.audience')"
        field="audience_id"
      />
      <TableHeader>{{ t('pages.clients.redirectUris') }}</TableHeader>
      <TableHeader fit>{{ t('pages.clients.actions') }}</TableHeader>
    </template>

    <template #rows>
      <tr v-for="client in clientStore.clients.items" :key="client.client_id">
        <TableCell primary fit>
          {{ client.client_id }}
        </TableCell>
        <TableCell fit>
          {{ client.type }}
        </TableCell>
        <TableCell fit hidden-below="sm">
          {{ client.audience_id }}
        </TableCell>
        <TableCell>
          <div v-for="uri in client.allowed_redirect_uris" :key="uri" class="truncate">
            {{ uri }}
          </div>
        </TableCell>
        <TableCell fit>
          <CommonButton
            collapse-label
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
