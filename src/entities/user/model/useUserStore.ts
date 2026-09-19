import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useCollection } from '@/shared/collection'
import { UserApi } from '../api/UserApi'
import type { UserListResource } from './UserListResource'
import type { UserResource } from './UserResource'

export const useUserStore = defineStore('users', () => {
  const api = new UserApi()

  // Which claims each user comes back with. It picks the columns the page draws rather than the
  // rows the server keeps, so it is not a criterion and travels beside them.
  const selectedClaimIds = ref<string[]>([])

  const users = useCollection<UserResource, UserListResource>({
    capabilities: () => api.getUserCapabilities(),
    page: (params) => api.listUsers(params),
    items: (content) => content.users,
    selection: () => ({
      claims: selectedClaimIds.value.length > 0 ? selectedClaimIds.value.join(',') : undefined
    })
  })

  function setSelectedClaimIds(claimIds: string[]) {
    selectedClaimIds.value = claimIds
  }

  return {
    users,
    selectedClaimIds,
    setSelectedClaimIds
  }
})
