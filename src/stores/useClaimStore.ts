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

    loading.value = false
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
  }
})
