import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useCollection } from '@/shared/collection'
import { isSuccess, type ErrorApiResponse, getErrorMessage } from '@/shared/api'
import { AudienceApi } from '../api/AudienceApi'
import type { AudienceListResource } from './AudienceListResource'
import type { AudienceResource } from './AudienceResource'

/**
 * The page size a complete read walks the collection in. It is not the one the list page displays:
 * nothing is rendered from it, so it is set to reach the end in as few requests as the server's
 * ceiling allows.
 */
const PICKER_PAGE_SIZE = 100

export const useAudienceStore = defineStore('audiences', () => {
  const api = new AudienceApi()

  const audiences = useCollection<AudienceResource, AudienceListResource>({
    capabilities: () => api.getAudienceCapabilities(),
    page: (params) => api.listAudiences(params),
    items: (content) => content.audiences
  })

  // Every audience there is, for a picker that has to offer all of them. It is its own state rather
  // than the collection's rows: a dialog filling it would otherwise replace what the list page is
  // displaying.
  const allAudiences = ref<AudienceResource[]>([])
  const allAudiencesLoading = ref(false)
  const allAudiencesError = ref<string | null>(null)

  async function fetchAllAudiences(): Promise<void> {
    allAudiencesLoading.value = true
    allAudiencesError.value = null

    const accumulated: AudienceResource[] = []
    let currentPage = 0
    let total = 0

    do {
      const response = await api.listAudiences({ page: currentPage, size: PICKER_PAGE_SIZE })

      if (!isSuccess(response)) {
        allAudiencesError.value = getErrorMessage(response as ErrorApiResponse)
        allAudiences.value = []
        allAudiencesLoading.value = false
        return
      }

      accumulated.push(...response.content.audiences)
      total = response.content.total
      currentPage++

      // Guard against an infinite loop if a page comes back empty while `total` is still higher.
      if (response.content.audiences.length === 0) {
        break
      }
    } while (accumulated.length < total)

    allAudiences.value = accumulated
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
