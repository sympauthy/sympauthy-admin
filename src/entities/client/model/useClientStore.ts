import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchAllPages, useCollection } from '@/shared/collection'
import { getErrorMessage } from '@/shared/api'
import { ClientApi } from '../api/ClientApi'
import type { ClientListResource } from './ClientListResource'
import type { ClientSummaryResource } from './ClientSummaryResource'

export const useClientStore = defineStore('clients', () => {
  const api = new ClientApi()

  const clients = useCollection<ClientSummaryResource, ClientListResource>({
    capabilities: () => api.getClientCapabilities(),
    page: (params) => api.listClients(params),
    items: (content) => content.clients
  })

  // Every client there is, for a picker that has to offer all of them.
  const allClients = ref<ClientSummaryResource[]>([])
  const allClientsLoading = ref(false)
  const allClientsError = ref<string | null>(null)

  async function fetchAllClients(): Promise<void> {
    allClientsLoading.value = true
    allClientsError.value = null

    const result = await fetchAllPages(
      (params) => api.listClients(params),
      (content) => content.clients
    )

    if (result.error) {
      allClientsError.value = getErrorMessage(result.error)
      allClients.value = []
    } else {
      allClients.value = result.items
    }

    allClientsLoading.value = false
  }

  return {
    clients,
    allClients,
    allClientsLoading,
    allClientsError,
    fetchAllClients
  }
})
