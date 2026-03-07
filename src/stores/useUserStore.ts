import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { UserApi } from '@/client/api/UserApi'
import type { UserResource } from '@/client/model/UserResource'
import { isSuccess } from '@/client/SuccessApiResponse'
import { type ErrorApiResponse, getErrorMessage } from '@/client/ErrorApiResponse'

export const useUserStore = defineStore('users', () => {
  const api = new UserApi()

  const users = ref<UserResource[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const page = ref(0)
  const size = ref(20)
  const total = ref(0)

  const searchQuery = ref('')
  const statusFilter = ref('')
  const claimFilters = ref<Record<string, string>>({})
  const sortField = ref('')
  const sortOrder = ref('')
  const selectedClaimIds = ref<string[]>([])

  const totalPages = computed(() => Math.ceil(total.value / size.value))

  async function fetchUsers(requestedPage: number = 0): Promise<void> {
    loading.value = true
    error.value = null

    const params: Record<string, string | number | undefined> = {
      page: requestedPage,
      size: size.value,
    }

    if (selectedClaimIds.value.length > 0) {
      params.claims = selectedClaimIds.value.join(',')
    }
    if (searchQuery.value) {
      params.q = searchQuery.value
    }
    if (statusFilter.value) {
      params.status = statusFilter.value
    }
    if (sortField.value) {
      params.sort = sortField.value
      params.order = sortOrder.value || 'asc'
    }

    for (const [claimId, value] of Object.entries(claimFilters.value)) {
      if (value) {
        params[claimId] = value
      }
    }

    const response = await api.listUsers(params)

    if (isSuccess(response)) {
      users.value = response.content.users
      page.value = response.content.page
      total.value = response.content.total
    } else {
      error.value = getErrorMessage(response as ErrorApiResponse)
      users.value = []
    }

    loading.value = false
  }

  function setSearch(q: string) {
    searchQuery.value = q
    fetchUsers(0)
  }

  function setStatusFilter(status: string) {
    statusFilter.value = status
    fetchUsers(0)
  }

  function setClaimFilter(claimId: string, value: string) {
    claimFilters.value[claimId] = value
    fetchUsers(0)
  }

  function toggleSort(field: string) {
    if (sortField.value !== field) {
      sortField.value = field
      sortOrder.value = 'asc'
    } else if (sortOrder.value === 'asc') {
      sortOrder.value = 'desc'
    } else {
      sortField.value = ''
      sortOrder.value = ''
    }
    fetchUsers(0)
  }

  function setSelectedClaimIds(claimIds: string[]) {
    selectedClaimIds.value = claimIds
  }

  return {
    users,
    loading,
    error,
    page,
    size,
    total,
    totalPages,
    searchQuery,
    statusFilter,
    claimFilters,
    sortField,
    sortOrder,
    selectedClaimIds,
    fetchUsers,
    setSearch,
    setStatusFilter,
    setClaimFilter,
    toggleSort,
    setSelectedClaimIds,
  }
})
