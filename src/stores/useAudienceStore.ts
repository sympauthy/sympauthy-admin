import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AudienceApi } from '@/client/api/AudienceApi'
import type { AudienceResource } from '@/client/model/AudienceResource'
import { isSuccess } from '@/client/SuccessApiResponse'
import { type ErrorApiResponse, getErrorMessage } from '@/client/ErrorApiResponse'

export const useAudienceStore = defineStore('audiences', () => {
  const api = new AudienceApi()

  const audiences = ref<AudienceResource[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const page = ref(0)
  const size = ref(20)
  const total = ref(0)

  const totalPages = computed(() => Math.ceil(total.value / size.value))

  async function fetchAudiences(requestedPage: number = 0): Promise<void> {
    loading.value = true
    error.value = null

    const response = await api.listAudiences(requestedPage, size.value)

    if (isSuccess(response)) {
      audiences.value = response.content.audiences
      page.value = response.content.page
      total.value = response.content.total
    } else {
      error.value = getErrorMessage(response as ErrorApiResponse)
      audiences.value = []
    }

    loading.value = false
  }

  return {
    audiences,
    loading,
    error,
    page,
    size,
    total,
    totalPages,
    fetchAudiences
  }
})
