import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useCollection } from '@/shared/collection'
import { isSuccess, type ErrorApiResponse, getErrorMessage } from '@/shared/api'
import { ClaimApi } from '../api/ClaimApi'
import type { ClaimListResource } from './ClaimListResource'
import type { ClaimResource } from './ClaimResource'

/**
 * One request, sized past any plausible number of configured claims, so the columns of a table that
 * draws one per claim are known before its first page is asked for.
 */
const CONFIGURED_CLAIMS_PAGE_SIZE = 100

export const useClaimStore = defineStore('claims', () => {
  const api = new ClaimApi()

  const claims = useCollection<ClaimResource, ClaimListResource>({
    capabilities: () => api.getClaimCapabilities(),
    page: (params) => api.listClaims(params),
    items: (content) => content.claims
  })

  // The claims an account is identified by, which are the columns of the accounts table and what it
  // asks the server to embed in each row. It is its own state rather than the collection's rows: a
  // screen reading it is not the one listing claims.
  const identifierClaims = ref<ClaimResource[]>([])
  const identifierClaimsError = ref<string | null>(null)

  async function fetchIdentifierClaims(): Promise<void> {
    identifierClaimsError.value = null

    const response = await api.listClaims({ page: 0, size: CONFIGURED_CLAIMS_PAGE_SIZE })

    if (isSuccess(response)) {
      identifierClaims.value = response.content.claims.filter((c) => c.enabled && c.identifier)
    } else {
      identifierClaimsError.value = getErrorMessage(response as ErrorApiResponse)
      identifierClaims.value = []
    }
  }

  return { claims, identifierClaims, identifierClaimsError, fetchIdentifierClaims }
})
