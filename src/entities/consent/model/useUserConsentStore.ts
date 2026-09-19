import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ConsentApi } from '../api/ConsentApi'
import type { ConsentResource } from './ConsentResource'
import { isSuccess, getErrorMessage } from '@/shared/api'

export const useUserConsentStore = defineStore('userConsent', () => {
  const consentApi = new ConsentApi()

  const consents = ref<ConsentResource[]>([])
  const consentsLoading = ref(false)
  const consentsError = ref<string | null>(null)
  const consentsPage = ref(0)
  const consentsSize = ref(20)
  const consentsTotal = ref(0)

  const consentsTotalPages = computed(() => Math.ceil(consentsTotal.value / consentsSize.value))

  async function fetchConsents(userId: string, requestedPage: number = 0): Promise<void> {
    consentsLoading.value = true
    consentsError.value = null

    const response = await consentApi.listConsents(userId, requestedPage, consentsSize.value)

    if (isSuccess(response)) {
      consents.value = response.content.consents
      consentsPage.value = response.content.page
      consentsTotal.value = response.content.total
    } else {
      consentsError.value = getErrorMessage(response)
      consents.value = []
    }

    consentsLoading.value = false
  }

  async function revokeConsent(userId: string, audienceId: string): Promise<void> {
    const response = await consentApi.revokeConsent(userId, audienceId)

    if (isSuccess(response)) {
      await fetchConsents(userId, consentsPage.value)
    } else {
      consentsError.value = getErrorMessage(response)
    }
  }

  function $reset() {
    consents.value = []
    consentsLoading.value = false
    consentsError.value = null
    consentsPage.value = 0
    consentsTotal.value = 0
  }

  return {
    consents,
    consentsLoading,
    consentsError,
    consentsPage,
    consentsSize,
    consentsTotal,
    consentsTotalPages,
    fetchConsents,
    revokeConsent,
    $reset
  }
})
