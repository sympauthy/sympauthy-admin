import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { UserApi } from '@/client/api/UserApi'
import { ConsentApi } from '@/client/api/ConsentApi'
import type { UserResource } from '@/client/model/UserResource'
import type { ConsentResource } from '@/client/model/ConsentResource'
import { isSuccess } from '@/client/SuccessApiResponse'
import { type ErrorApiResponse, getErrorMessage } from '@/client/ErrorApiResponse'

export const useUserDetailStore = defineStore('userDetail', () => {
  const userApi = new UserApi()
  const consentApi = new ConsentApi()

  const user = ref<UserResource | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const consents = ref<ConsentResource[]>([])
  const consentsLoading = ref(false)
  const consentsError = ref<string | null>(null)
  const consentsPage = ref(0)
  const consentsSize = ref(20)
  const consentsTotal = ref(0)

  const consentsTotalPages = computed(() => Math.ceil(consentsTotal.value / consentsSize.value))

  async function fetchUser(userId: string): Promise<void> {
    loading.value = true
    error.value = null

    const response = await userApi.getUser(userId)

    if (isSuccess(response)) {
      user.value = response.content
    } else {
      error.value = getErrorMessage(response as ErrorApiResponse)
      user.value = null
    }

    loading.value = false
  }

  async function fetchConsents(userId: string, requestedPage: number = 0): Promise<void> {
    consentsLoading.value = true
    consentsError.value = null

    const response = await consentApi.listConsents(userId, requestedPage, consentsSize.value)

    if (isSuccess(response)) {
      consents.value = response.content.consents
      consentsPage.value = response.content.page
      consentsTotal.value = response.content.total
    } else {
      consentsError.value = getErrorMessage(response as ErrorApiResponse)
      consents.value = []
    }

    consentsLoading.value = false
  }

  async function revokeConsent(userId: string, clientId: string): Promise<void> {
    const response = await consentApi.revokeConsent(userId, clientId)

    if (isSuccess(response)) {
      await fetchConsents(userId, consentsPage.value)
    } else {
      consentsError.value = getErrorMessage(response as ErrorApiResponse)
    }
  }

  function $reset() {
    user.value = null
    loading.value = false
    error.value = null
    consents.value = []
    consentsLoading.value = false
    consentsError.value = null
    consentsPage.value = 0
    consentsTotal.value = 0
  }

  return {
    user,
    loading,
    error,
    consents,
    consentsLoading,
    consentsError,
    consentsPage,
    consentsSize,
    consentsTotal,
    consentsTotalPages,
    fetchUser,
    fetchConsents,
    revokeConsent,
    $reset,
  }
})
