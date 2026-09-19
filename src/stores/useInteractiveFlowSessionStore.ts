import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { InteractiveFlowSessionApi } from '@/client/api/InteractiveFlowSessionApi'
import type { ListInteractiveFlowSessionsParams } from '@/client/api/InteractiveFlowSessionApi'
import type { InteractiveFlowSessionSummaryResource } from '@/client/model/InteractiveFlowSessionSummaryResource'
import { isSuccess } from '@/shared/api/SuccessApiResponse'
import { type ErrorApiResponse, getErrorMessage } from '@/shared/api/ErrorApiResponse'

export const useInteractiveFlowSessionStore = defineStore('interactiveFlowSessions', () => {
  const api = new InteractiveFlowSessionApi()

  const sessions = ref<InteractiveFlowSessionSummaryResource[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const page = ref(0)
  const size = ref(20)
  const total = ref(0)
  // Set once a first response arrived. A page size change before that would request a page the
  // component is about to request anyway.
  const loaded = ref(false)

  const searchQuery = ref('')
  const statusFilter = ref('')
  const purposeFilter = ref('')
  // The endpoint orders by the date the session started and takes no sort field, so only the
  // direction travels.
  const order = ref('asc')

  const totalPages = computed(() => Math.ceil(total.value / size.value))

  async function fetchSessions(requestedPage: number = 0): Promise<void> {
    loading.value = true
    error.value = null

    const params: ListInteractiveFlowSessionsParams = {
      page: requestedPage,
      size: size.value,
      order: order.value
    }

    if (searchQuery.value) {
      params.q = searchQuery.value
    }
    if (statusFilter.value) {
      params.status = statusFilter.value
    }
    if (purposeFilter.value) {
      params.purpose = purposeFilter.value
    }

    const response = await api.listSessions(params)

    if (isSuccess(response)) {
      sessions.value = response.content.sessions
      page.value = response.content.page
      total.value = response.content.total
    } else {
      error.value = getErrorMessage(response as ErrorApiResponse)
      sessions.value = []
    }

    loaded.value = true
    loading.value = false
  }

  function setSearch(q: string) {
    searchQuery.value = q
    fetchSessions(0)
  }

  function setStatusFilter(status: string) {
    statusFilter.value = status
    fetchSessions(0)
  }

  function clearStatusFilter() {
    statusFilter.value = ''
    fetchSessions(0)
  }

  function setPurposeFilter(purpose: string) {
    purposeFilter.value = purpose
    fetchSessions(0)
  }

  function clearPurposeFilter() {
    purposeFilter.value = ''
    fetchSessions(0)
  }

  // The listing is always ordered by the date the session started, so the header toggles the
  // direction alone. An unsorted state would be ascending, which is what the server already does.
  function toggleOrder() {
    order.value = order.value === 'asc' ? 'desc' : 'asc'
    fetchSessions(0)
  }

  // The search box and the filter chips are rebuilt empty every time the page is mounted, so the
  // criteria are cleared with them: keeping them would narrow the list with nothing on screen
  // saying so.
  function $reset() {
    sessions.value = []
    error.value = null
    page.value = 0
    total.value = 0
    loaded.value = false
    searchQuery.value = ''
    statusFilter.value = ''
    purposeFilter.value = ''
    order.value = 'asc'
  }

  // Adjusts the number of items per page. The page holding the first item currently displayed is
  // requested again, so resizing the viewport keeps the user roughly in place.
  function setSize(newSize: number) {
    if (newSize < 1 || newSize === size.value) {
      return
    }
    const firstItem = page.value * size.value
    size.value = newSize
    if (loaded.value) {
      fetchSessions(Math.floor(firstItem / newSize))
    }
  }

  return {
    sessions,
    loading,
    error,
    page,
    size,
    total,
    totalPages,
    searchQuery,
    statusFilter,
    purposeFilter,
    order,
    fetchSessions,
    $reset,
    setSize,
    setSearch,
    setStatusFilter,
    clearStatusFilter,
    setPurposeFilter,
    clearPurposeFilter,
    toggleOrder
  }
})
