import { defineStore } from 'pinia'
import { ref } from 'vue'
import { InteractiveFlowSessionApi } from '../api/InteractiveFlowSessionApi'
import type { InteractiveFlowSessionDetailResource } from './InteractiveFlowSessionDetailResource'
import { isSuccess, getErrorMessage } from '@/shared/api'

export const useInteractiveFlowSessionDetailStore = defineStore(
  'interactiveFlowSessionDetail',
  () => {
    const api = new InteractiveFlowSessionApi()

    const session = ref<InteractiveFlowSessionDetailResource | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    // A session that has been collected is the expected outcome of this page rather than a failure,
    // so it is held apart from the errors and gets its own copy.
    const notFound = ref(false)

    async function fetchSession(sessionId: string): Promise<void> {
      loading.value = true
      error.value = null
      notFound.value = false

      const response = await api.getSession(sessionId)

      if (isSuccess(response)) {
        session.value = response.content
      } else {
        const errorResponse = response
        session.value = null
        if (errorResponse.response?.status === 404) {
          notFound.value = true
        } else {
          error.value = getErrorMessage(errorResponse)
        }
      }

      loading.value = false
    }

    function $reset() {
      session.value = null
      loading.value = false
      error.value = null
      notFound.value = false
    }

    return {
      session,
      loading,
      error,
      notFound,
      fetchSession,
      $reset
    }
  }
)
