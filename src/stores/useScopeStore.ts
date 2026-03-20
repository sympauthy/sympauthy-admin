import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ScopeApi } from '@/client/api/ScopeApi'
import type { ScopeResource } from '@/client/model/ScopeResource'
import { isSuccess } from '@/client/SuccessApiResponse'
import { type ErrorApiResponse, getErrorMessage } from '@/client/ErrorApiResponse'

export const useScopeStore = defineStore('scopes', () => {
  const api = new ScopeApi()

  const scopes = ref<ScopeResource[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const page = ref(0)
  const size = ref(20)
  const total = ref(0)

  const typeFilter = ref('')
  const enabledFilter = ref('')

  const totalPages = computed(() => Math.ceil(total.value / size.value))

  async function fetchScopes(requestedPage: number = 0): Promise<void> {
    loading.value = true
    error.value = null

    const response = await api.listScopes(
      requestedPage,
      size.value,
      typeFilter.value || undefined,
      enabledFilter.value || undefined,
    )

    if (isSuccess(response)) {
      scopes.value = response.content.scopes
      page.value = response.content.page
      total.value = response.content.total
    } else {
      error.value = getErrorMessage(response as ErrorApiResponse)
      scopes.value = []
    }

    loading.value = false
  }

  function setTypeFilter(value: string) {
    typeFilter.value = value
    fetchScopes(0)
  }

  function setEnabledFilter(value: string) {
    enabledFilter.value = value
    fetchScopes(0)
  }

  function clearTypeFilter() {
    typeFilter.value = ''
    fetchScopes(0)
  }

  function clearEnabledFilter() {
    enabledFilter.value = ''
    fetchScopes(0)
  }

  return {
    scopes,
    loading,
    error,
    page,
    size,
    total,
    totalPages,
    typeFilter,
    enabledFilter,
    fetchScopes,
    setTypeFilter,
    setEnabledFilter,
    clearTypeFilter,
    clearEnabledFilter,
  }
})
