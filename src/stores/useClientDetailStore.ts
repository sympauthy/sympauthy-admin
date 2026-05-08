import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ClientApi } from '@/client/api/ClientApi'
import type { ClientDetailResource } from '@/client/model/ClientDetailResource'
import { isSuccess } from '@/client/SuccessApiResponse'
import { type ErrorApiResponse, getErrorMessage } from '@/client/ErrorApiResponse'

export const useClientDetailStore = defineStore('clientDetail', () => {
  const api = new ClientApi()

  const client = ref<ClientDetailResource | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchClient(clientId: string): Promise<void> {
    loading.value = true
    error.value = null

    const response = await api.getClient(clientId)

    if (isSuccess(response)) {
      client.value = response.content
    } else {
      error.value = getErrorMessage(response as ErrorApiResponse)
      client.value = null
    }

    loading.value = false
  }

  function $reset() {
    client.value = null
    loading.value = false
    error.value = null
  }

  return {
    client,
    loading,
    error,
    fetchClient,
    $reset
  }
})
