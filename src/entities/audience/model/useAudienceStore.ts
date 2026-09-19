import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchAllPages, getErrorMessage } from '@/shared/api'
import { AudienceApi } from '../api/AudienceApi'
import type { AudienceResource } from './AudienceResource'

export const useAudienceStore = defineStore('audiences', () => {
  const api = new AudienceApi()

  // Every audience there is, for a picker that has to offer all of them. A screen listing audiences
  // holds its own page of them, and the two are never the same question.
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
    allAudiences,
    allAudiencesLoading,
    allAudiencesError,
    fetchAllAudiences
  }
})
