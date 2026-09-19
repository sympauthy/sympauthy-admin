import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useCollection } from '@/shared/collection'
import { isSuccess, type ErrorApiResponse, getErrorMessage } from '@/shared/api'
import { UserProviderLinkApi } from '../api/UserProviderLinkApi'
import type { UserProviderLinkListResource } from './UserProviderLinkListResource'
import type { UserProviderLinkResource } from './UserProviderLinkResource'

export const useUserProviderLinkStore = defineStore('userProviderLink', () => {
  const api = new UserProviderLinkApi()

  // The account whose linked providers are read. The collection reads it at the moment it calls, so
  // paging and filtering stay on the record the page last asked for.
  const userId = ref('')

  const providerLinks = useCollection<UserProviderLinkResource, UserProviderLinkListResource>({
    capabilities: () => api.getProviderLinkCapabilities(userId.value),
    page: (params) => api.listProviderLinks(userId.value, params),
    items: (content) => content.providers
  })

  async function fetchProviderLinks(id: string): Promise<void> {
    userId.value = id
    await providerLinks.fetch(0)
  }

  async function unlinkProvider(providerId: string): Promise<void> {
    const response = await api.unlinkProvider(userId.value, providerId)

    if (isSuccess(response)) {
      await providerLinks.fetch(providerLinks.page)
    } else {
      providerLinks.error = getErrorMessage(response as ErrorApiResponse)
    }
  }

  function $reset() {
    providerLinks.reset()
  }

  return { providerLinks, fetchProviderLinks, unlinkProvider, $reset }
})
