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
  // Set once a first response arrived. A page size change before that would request a page the
  // component is about to request anyway.
  const loaded = ref(false)

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

    loaded.value = true
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
      fetchAudiences(Math.floor(firstItem / newSize))
    }
  }

  return {
    audiences,
    loading,
    error,
    page,
    size,
    total,
    totalPages,
    fetchAudiences,
    setSize
  }
})
