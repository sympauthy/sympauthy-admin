import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useCollection } from '@/shared/collection'
import { UserApi } from '../api/UserApi'
import type { UserClaimListResource } from './UserClaimListResource'
import type { UserClaimResource } from './UserClaimResource'

export const useUserClaimStore = defineStore('userClaim', () => {
  const api = new UserApi()

  // The account whose claims are read. The collection reads it at the moment it calls, so paging
  // and filtering stay on the record the page last asked for.
  const userId = ref('')

  const claims = useCollection<UserClaimResource, UserClaimListResource>({
    capabilities: () => api.getUserClaimCapabilities(userId.value),
    page: (params) => api.listUserClaims(userId.value, params),
    items: (content) => content.claims
  })

  async function fetchClaims(id: string): Promise<void> {
    userId.value = id
    await claims.fetch(0)
  }

  function $reset() {
    claims.reset()
  }

  return { claims, fetchClaims, $reset }
})
