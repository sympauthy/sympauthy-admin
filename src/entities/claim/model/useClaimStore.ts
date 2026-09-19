import { defineStore } from 'pinia'
import { useCollection } from '@/shared/collection'
import { ClaimApi } from '../api/ClaimApi'
import type { ClaimListResource } from './ClaimListResource'
import type { ClaimResource } from './ClaimResource'

export const useClaimStore = defineStore('claims', () => {
  const api = new ClaimApi()

  const claims = useCollection<ClaimResource, ClaimListResource>({
    capabilities: () => api.getClaimCapabilities(),
    page: (params) => api.listClaims(params),
    items: (content) => content.claims
  })

  return { claims }
})
