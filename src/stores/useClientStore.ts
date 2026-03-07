import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ClientApi } from '@/client/api/ClientApi'
import type { ClientResource } from '@/client/model/ClientResource'
import { isSuccess } from '@/client/SuccessApiResponse'
import { type ErrorApiResponse, getErrorMessage } from '@/client/ErrorApiResponse'

export const useClientStore = defineStore('clients', () => {
  const api = new ClientApi()

  const clients = ref<ClientResource[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const page = ref(0)
  const size = ref(20)
  const total = ref(0)

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

    loading.value = false
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
  }
})
