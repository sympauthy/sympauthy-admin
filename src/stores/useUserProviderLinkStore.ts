import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { UserProviderLinkApi } from '@/client/api/UserProviderLinkApi'
import type { UserProviderLinkResource } from '@/client/model/UserProviderLinkResource'
import { isSuccess } from '@/client/SuccessApiResponse'
import { type ErrorApiResponse, getErrorMessage } from '@/client/ErrorApiResponse'

export const useUserProviderLinkStore = defineStore('userProviderLink', () => {
  const providerLinkApi = new UserProviderLinkApi()

  const providerLinks = ref<UserProviderLinkResource[]>([])
  const providerLinksLoading = ref(false)
  const providerLinksError = ref<string | null>(null)
  const providerLinksPage = ref(0)
  const providerLinksSize = ref(20)
  const providerLinksTotal = ref(0)

  const providerLinksTotalPages = computed(() =>
    Math.ceil(providerLinksTotal.value / providerLinksSize.value),
  )

  async function fetchProviderLinks(
    userId: string,
    requestedPage: number = 0,
  ): Promise<void> {
    providerLinksLoading.value = true
    providerLinksError.value = null

    const response = await providerLinkApi.listProviderLinks(
      userId,
      requestedPage,
      providerLinksSize.value,
    )

    if (isSuccess(response)) {
      providerLinks.value = response.content.providers
      providerLinksPage.value = response.content.page
      providerLinksTotal.value = response.content.total
    } else {
      providerLinksError.value = getErrorMessage(response as ErrorApiResponse)
      providerLinks.value = []
    }

    providerLinksLoading.value = false
  }

  async function unlinkProvider(userId: string, providerId: string): Promise<void> {
    const response = await providerLinkApi.unlinkProvider(userId, providerId)

    if (isSuccess(response)) {
      await fetchProviderLinks(userId, providerLinksPage.value)
    } else {
      providerLinksError.value = getErrorMessage(response as ErrorApiResponse)
    }
  }

  function $reset() {
    providerLinks.value = []
    providerLinksLoading.value = false
    providerLinksError.value = null
    providerLinksPage.value = 0
    providerLinksTotal.value = 0
  }

  return {
    providerLinks,
    providerLinksLoading,
    providerLinksError,
    providerLinksPage,
    providerLinksSize,
    providerLinksTotal,
    providerLinksTotalPages,
    fetchProviderLinks,
    unlinkProvider,
    $reset,
  }
})
