import { defineStore } from 'pinia'
import { ref } from 'vue'
import { UserApi } from '../api/UserApi'
import type { UserDetailResource } from './UserDetailResource'
import { isSuccess, type ErrorApiResponse, getErrorMessage } from '@/shared/api'

export const useUserDetailStore = defineStore('userDetail', () => {
  const userApi = new UserApi()

  const user = ref<UserDetailResource | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

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

  function $reset() {
    user.value = null
    loading.value = false
    error.value = null
  }

  return {
    user,
    loading,
    error,
    fetchUser,
    $reset
  }
})
