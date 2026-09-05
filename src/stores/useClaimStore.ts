import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ClaimApi } from '@/client/api/ClaimApi'
import type { ClaimResource } from '@/client/model/ClaimResource'
import { isSuccess } from '@/client/SuccessApiResponse'
import { type ErrorApiResponse, getErrorMessage } from '@/client/ErrorApiResponse'

export const useClaimStore = defineStore('claims', () => {
  const api = new ClaimApi()

  const claims = ref<ClaimResource[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const page = ref(0)
  const size = ref(20)
  const total = ref(0)
  // Set once a first response arrived. A page size change before that would request a page the
  // component is about to request anyway.
  const loaded = ref(false)

  const totalPages = computed(() => Math.ceil(total.value / size.value))

  async function fetchClaims(requestedPage: number = 0): Promise<void> {
    loading.value = true
    error.value = null

    const response = await api.listClaims(requestedPage, size.value)

    if (isSuccess(response)) {
      claims.value = response.content.claims
      page.value = response.content.page
      total.value = response.content.total
    } else {
      error.value = getErrorMessage(response as ErrorApiResponse)
      claims.value = []
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
      fetchClaims(Math.floor(firstItem / newSize))
    }
  }

  return {
    claims,
    loading,
    error,
    page,
    size,
    total,
    totalPages,
    fetchClaims,
    setSize
  }
})
