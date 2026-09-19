import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useCollection } from '@/shared/collection'
import { isSuccess, type ErrorApiResponse, getErrorMessage } from '@/shared/api'
import { ClientApi } from '../api/ClientApi'
import type { ClientListResource } from './ClientListResource'
import type { ClientSummaryResource } from './ClientSummaryResource'

/**
 * The page size a complete read walks the collection in. It is not the one the list page displays:
 * nothing is rendered from it, so it is set to reach the end in as few requests as the server's
 * ceiling allows.
 */
const PICKER_PAGE_SIZE = 100

export const useClientStore = defineStore('clients', () => {
  const api = new ClientApi()

  const clients = useCollection<ClientSummaryResource, ClientListResource>({
    capabilities: () => api.getClientCapabilities(),
    page: (params) => api.listClients(params),
    items: (content) => content.clients
  })

  // Every client there is, for a picker that has to offer all of them. It is its own state rather
  // than the collection's rows: a dialog filling it would otherwise replace what the list page is
  // displaying, and the two are read at the same time.
  const allClients = ref<ClientSummaryResource[]>([])
  const allClientsLoading = ref(false)
  const allClientsError = ref<string | null>(null)

  async function fetchAllClients(): Promise<void> {
    allClientsLoading.value = true
    allClientsError.value = null

    const accumulated: ClientSummaryResource[] = []
    let currentPage = 0
    let total = 0

    do {
      const response = await api.listClients({ page: currentPage, size: PICKER_PAGE_SIZE })

      if (!isSuccess(response)) {
        allClientsError.value = getErrorMessage(response as ErrorApiResponse)
        allClients.value = []
        allClientsLoading.value = false
        return
      }

      accumulated.push(...response.content.clients)
      total = response.content.total
      currentPage++

      // Guard against an infinite loop if a page comes back empty while `total` is still higher.
      if (response.content.clients.length === 0) {
        break
      }
    } while (accumulated.length < total)

    allClients.value = accumulated
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
