<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { useClientStore } from '@/stores/useClientStore'
import PaginatedTable from '@/components/PaginatedTable.vue'
import ClientTypeHelpTooltip from '@/components/ClientTypeHelpTooltip.vue'

const { t } = useI18n()
const clientStore = useClientStore()

onMounted(async () => {
  await clientStore.fetchClients()
})
</script>

<template>
  <div>
    <PaginatedTable
      :loading="clientStore.loading"
      :error="clientStore.error"
      :empty="clientStore.clients.length === 0"
      :page="clientStore.page"
      :total-pages="clientStore.totalPages"
      @page-change="clientStore.fetchClients"
    >
      <template #header>
        <th
          class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-0 whitespace-nowrap"
        >
          {{ t('pages.clients.clientId') }}
        </th>
        <th
          class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-0 whitespace-nowrap"
        >
          {{ t('pages.clients.type') }}
          <ClientTypeHelpTooltip />
        </th>
        <th
          class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-0 whitespace-nowrap hidden sm:table-cell"
        >
          {{ t('pages.clients.audience') }}
        </th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.clients.redirectUris') }}
        </th>
      </template>

      <template #rows>
        <tr v-for="client in clientStore.clients" :key="client.client_id">
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            <RouterLink
              :to="{ name: 'clientDetail', params: { clientId: client.client_id } }"
              class="text-indigo-600 hover:text-indigo-900"
            >
              {{ client.client_id }}
            </RouterLink>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ client.type }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
            {{ client.audience_id }}
          </td>
          <td class="px-6 py-4 text-sm text-gray-500">
            <div v-for="uri in client.allowed_redirect_uris" :key="uri" class="truncate">
              {{ uri }}
            </div>
          </td>
        </tr>
      </template>

      <template #empty>
        <p class="text-gray-600">{{ t('pages.clients.empty') }}</p>
      </template>
    </PaginatedTable>
  </div>
</template>
