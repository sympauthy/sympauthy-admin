<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClientStore } from '@/stores/useClientStore'
import PaginatedTable from '@/components/PaginatedTable.vue'

const { t } = useI18n()
const clientStore = useClientStore()

onMounted(async () => {
  await clientStore.fetchClients()
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">{{ t('pages.clients.title') }}</h1>

    <PaginatedTable
      :loading="clientStore.loading"
      :error="clientStore.error"
      :empty="clientStore.clients.length === 0"
      :page="clientStore.page"
      :total-pages="clientStore.totalPages"
      @page-change="clientStore.fetchClients"
    >
      <template #header>
        <th class="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.clients.clientId') }}
        </th>
        <th class="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.clients.type') }}
        </th>
        <th class="w-[25%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.clients.allowedScopes') }}
        </th>
        <th class="w-[25%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.clients.defaultScopes') }}
        </th>
        <th class="w-[30%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.clients.redirectUris') }}
        </th>
      </template>

      <template #rows>
        <tr v-for="client in clientStore.clients" :key="client.client_id">
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {{ client.client_id }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ client.type }}
          </td>
          <td class="px-6 py-4 text-sm text-gray-500">
            <span
              v-for="scope in client.allowed_scopes"
              :key="scope"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-1 mb-1"
            >
              {{ scope }}
            </span>
          </td>
          <td class="px-6 py-4 text-sm text-gray-500">
            <span
              v-for="scope in client.default_scopes"
              :key="scope"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mr-1 mb-1"
            >
              {{ scope }}
            </span>
          </td>
          <td class="px-6 py-4 text-sm text-gray-500">
            <div v-for="uri in client.allowed_redirect_uris" :key="uri" class="truncate max-w-xs">
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
