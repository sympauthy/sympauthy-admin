import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchAllPages, useCollection } from '@/shared/collection'
import { getErrorMessage } from '@/shared/api'
import { AudienceApi } from '../api/AudienceApi'
import type { AudienceListResource } from './AudienceListResource'
import type { AudienceResource } from './AudienceResource'

export const useAudienceStore = defineStore('audiences', () => {
  const api = new AudienceApi()

  const audiences = useCollection<AudienceResource, AudienceListResource>({
    capabilities: () => api.getAudienceCapabilities(),
    page: (params) => api.listAudiences(params),
    items: (content) => content.audiences
  })

  // Every audience there is, for a picker that has to offer all of them.
  const allAudiences = ref<AudienceResource[]>([])
  const allAudiencesLoading = ref(false)
  const allAudiencesError = ref<string | null>(null)

  async function fetchAllAudiences(): Promise<void> {
    allAudiencesLoading.value = true
    allAudiencesError.value = null

    const result = await fetchAllPages(
      (params) => api.listAudiences(params),
      (content) => content.audiences
    )

    if (result.error) {
      allAudiencesError.value = getErrorMessage(result.error)
      allAudiences.value = []
    } else {
      allAudiences.value = result.items
    }

    allAudiencesLoading.value = false
  }

  return {
    audiences,
    allAudiences,
    allAudiencesLoading,
    allAudiencesError,
    fetchAllAudiences
  }
})
