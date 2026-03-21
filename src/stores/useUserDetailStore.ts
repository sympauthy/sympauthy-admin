import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { UserApi } from '@/client/api/UserApi'
import type { ListUserClaimsParams } from '@/client/api/UserApi'
import type { UserDetailResource } from '@/client/model/UserDetailResource'
import type { UserClaimResource } from '@/client/model/UserClaimResource'
import { isSuccess } from '@/client/SuccessApiResponse'
import { type ErrorApiResponse, getErrorMessage } from '@/client/ErrorApiResponse'

export const useUserDetailStore = defineStore('userDetail', () => {
  const userApi = new UserApi()

  const user = ref<UserDetailResource | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const claims = ref<UserClaimResource[]>([])
  const claimsLoading = ref(false)
  const claimsError = ref<string | null>(null)
  const claimsPage = ref(0)
  const claimsSize = ref(20)
  const claimsTotal = ref(0)

  const claimsTotalPages = computed(() => Math.ceil(claimsTotal.value / claimsSize.value))

  async function fetchUser(userId: string): Promise<void> {
    loading.value = true
    error.value = null

    const response = await userApi.getUser(userId)

    if (isSuccess(response)) {
      user.value = response.content
    } else {
      error.value = getErrorMessage(response as ErrorApiResponse)
      user.value = null
    }

    loading.value = false
  }

  async function fetchClaims(userId: string, requestedPage: number = 0, filters: ListUserClaimsParams = {}): Promise<void> {
    claimsLoading.value = true
    claimsError.value = null

    const response = await userApi.listUserClaims(userId, {
      ...filters,
      page: requestedPage,
      size: claimsSize.value,
    })

    if (isSuccess(response)) {
      claims.value = response.content.claims
      claimsPage.value = response.content.page
      claimsTotal.value = response.content.total
    } else {
      claimsError.value = getErrorMessage(response as ErrorApiResponse)
      claims.value = []
    }

    claimsLoading.value = false
  }

  function $reset() {
    user.value = null
    loading.value = false
    error.value = null
    claims.value = []
    claimsLoading.value = false
    claimsError.value = null
    claimsPage.value = 0
    claimsTotal.value = 0
  }

  return {
    user,
    loading,
    error,
    claims,
    claimsLoading,
    claimsError,
    claimsPage,
    claimsSize,
    claimsTotal,
    claimsTotalPages,
    fetchUser,
    fetchClaims,
    $reset,
  }
})
