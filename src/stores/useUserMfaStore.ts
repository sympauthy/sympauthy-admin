import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { UserMfaApi } from '@/client/api/UserMfaApi'
import type { UserMfaMethodResource } from '@/client/model/UserMfaMethodResource'
import { isSuccess } from '@/client/SuccessApiResponse'
import { type ErrorApiResponse, getErrorMessage } from '@/client/ErrorApiResponse'

export const useUserMfaStore = defineStore('userMfa', () => {
  const userMfaApi = new UserMfaApi()

  const mfaMethods = ref<UserMfaMethodResource[]>([])
  const mfaLoading = ref(false)
  const mfaError = ref<string | null>(null)
  const mfaPage = ref(0)
  const mfaSize = ref(20)
  const mfaTotal = ref(0)

  const mfaTotalPages = computed(() => Math.ceil(mfaTotal.value / mfaSize.value))

  async function fetchMfaMethods(userId: string, requestedPage: number = 0): Promise<void> {
    mfaLoading.value = true
    mfaError.value = null

    const response = await userMfaApi.listMfaMethods(userId, requestedPage, mfaSize.value)

    if (isSuccess(response)) {
      mfaMethods.value = response.content.mfa_methods
      mfaPage.value = response.content.page
      mfaTotal.value = response.content.total
    } else {
      mfaError.value = getErrorMessage(response as ErrorApiResponse)
      mfaMethods.value = []
    }

    mfaLoading.value = false
  }

  async function revokeMfaMethod(userId: string, mfaId: string): Promise<void> {
    const response = await userMfaApi.revokeMfaMethod(userId, mfaId)

    if (isSuccess(response)) {
      await fetchMfaMethods(userId, mfaPage.value)
    } else {
      mfaError.value = getErrorMessage(response as ErrorApiResponse)
    }
  }

  function $reset() {
    mfaMethods.value = []
    mfaLoading.value = false
    mfaError.value = null
    mfaPage.value = 0
    mfaTotal.value = 0
  }

  return {
    mfaMethods,
    mfaLoading,
    mfaError,
    mfaPage,
    mfaSize,
    mfaTotal,
    mfaTotalPages,
    fetchMfaMethods,
    revokeMfaMethod,
    $reset,
  }
})
