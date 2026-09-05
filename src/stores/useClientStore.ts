import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ClientApi } from '@/client/api/ClientApi'
import type { ClientSummaryResource } from '@/client/model/ClientSummaryResource'
import { isSuccess } from '@/client/SuccessApiResponse'
import { type ErrorApiResponse, getErrorMessage } from '@/client/ErrorApiResponse'

export const useClientStore = defineStore('clients', () => {
  const api = new ClientApi()

  const clients = ref<ClientSummaryResource[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const page = ref(0)
  const size = ref(20)
  const total = ref(0)
  // Set once a first response arrived. A page size change before that would request a page the
  // component is about to request anyway.
  const loaded = ref(false)

  const totalPages = computed(() => Math.ceil(total.value / size.value))

  async function fetchClients(requestedPage: number = 0): Promise<void> {
    loading.value = true
    error.value = null

    const response = await api.listClients(requestedPage, size.value)

    if (isSuccess(response)) {
      clients.value = response.content.clients
      page.value = response.content.page
      total.value = response.content.total
    } else {
      error.value = getErrorMessage(response as ErrorApiResponse)
      clients.value = []
    }

    loaded.value = true
    loading.value = false
  }

  // Loads every client across all pages, accumulating into `clients`. Used where a complete list is
  // required (e.g. a client picker) rather than a single displayed page.
  async function fetchAllClients(): Promise<void> {
    loading.value = true
    error.value = null

    const accumulated: ClientSummaryResource[] = []
    let currentPage = 0

    do {
      const response = await api.listClients(currentPage, size.value)

      if (!isSuccess(response)) {
        error.value = getErrorMessage(response as ErrorApiResponse)
        clients.value = []
        loading.value = false
        return
      }

      accumulated.push(...response.content.clients)
      total.value = response.content.total
      currentPage++

      // Guard against an infinite loop if a page comes back empty while `total` is still higher.
      if (response.content.clients.length === 0) {
        break
      }
    } while (accumulated.length < total.value)

    clients.value = accumulated
    page.value = 0
    loading.value = false
  }

  // Adjusts the number of items per page. The page holding the first item currently displayed is
  // requested again, so resizing the viewport keeps the user roughly in place.
  function setSize(newSize: number) {
    if (newSize < 1 || newSize === size.value) {
      return
    }
    const firstItem = page.value * size.value
    size.value = newSize
    if (loaded.value) {
      fetchClients(Math.floor(firstItem / newSize))
    }
  }

  return {
    clients,
    loading,
    error,
    page,
    size,
    total,
    totalPages,
    fetchClients,
    setSize,
    fetchAllClients
  }
})
