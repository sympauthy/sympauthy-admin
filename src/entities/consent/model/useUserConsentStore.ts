import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useCollection } from '@/shared/collection'
import { isSuccess, type ErrorApiResponse, getErrorMessage } from '@/shared/api'
import { ConsentApi } from '../api/ConsentApi'
import type { ConsentListResource } from './ConsentListResource'
import type { ConsentResource } from './ConsentResource'

export const useUserConsentStore = defineStore('userConsent', () => {
  const api = new ConsentApi()

  // The account whose consents are read. The collection reads it at the moment it calls, so paging
  // and filtering stay on the record the page last asked for.
  const userId = ref('')

  const consents = useCollection<ConsentResource, ConsentListResource>({
    capabilities: () => api.getConsentCapabilities(userId.value),
    page: (params) => api.listConsents(userId.value, params),
    items: (content) => content.consents
  })

  async function fetchConsents(id: string): Promise<void> {
    userId.value = id
    await consents.fetch(0)
  }

  async function revokeConsent(audienceId: string): Promise<void> {
    const response = await api.revokeConsent(userId.value, audienceId)

    if (isSuccess(response)) {
      await consents.fetch(consents.page)
    } else {
      consents.error = getErrorMessage(response as ErrorApiResponse)
    }
  }

  function $reset() {
    consents.reset()
  }

  return { consents, fetchConsents, revokeConsent, $reset }
})
