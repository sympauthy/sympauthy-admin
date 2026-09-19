import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchAllPages, getErrorMessage } from '@/shared/api'
import { ClientApi } from '../api/ClientApi'
import type { ClientSummaryResource } from './ClientSummaryResource'

export const useClientStore = defineStore('clients', () => {
  const api = new ClientApi()

  // Every client there is, for a picker that has to offer all of them. A screen listing clients
  // holds its own page of them, and the two are never the same question.
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
    allClients,
    allClientsLoading,
    allClientsError,
    fetchAllClients
  }
})
