import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useCollection } from '@/shared/collection'
import { isSuccess, type ErrorApiResponse, getErrorMessage } from '@/shared/api'
import { UserMfaApi } from '../api/UserMfaApi'
import type { UserMfaMethodListResource } from './UserMfaMethodListResource'
import type { UserMfaMethodResource } from './UserMfaMethodResource'

export const useUserMfaStore = defineStore('userMfa', () => {
  const api = new UserMfaApi()

  // The account whose enrolments are read. The collection reads it at the moment it calls, so
  // paging and filtering stay on the record the page last asked for.
  const userId = ref('')

  const mfaMethods = useCollection<UserMfaMethodResource, UserMfaMethodListResource>({
    capabilities: () => api.getMfaCapabilities(userId.value),
    page: (params) => api.listMfaMethods(userId.value, params),
    items: (content) => content.mfa_methods
  })

  async function fetchMfaMethods(id: string): Promise<void> {
    userId.value = id
    await mfaMethods.fetch(0)
  }

  async function revokeMfaMethod(mfaId: string): Promise<void> {
    const response = await api.revokeMfaMethod(userId.value, mfaId)

    if (isSuccess(response)) {
      await mfaMethods.fetch(mfaMethods.page)
    } else {
      mfaMethods.error = getErrorMessage(response as ErrorApiResponse)
    }
  }

  function $reset() {
    mfaMethods.reset()
  }

  return { mfaMethods, fetchMfaMethods, revokeMfaMethod, $reset }
})
