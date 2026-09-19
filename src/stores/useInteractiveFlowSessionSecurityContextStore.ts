import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { InteractiveFlowSessionApi } from '@/client/api/InteractiveFlowSessionApi'
import type { InteractiveFlowSessionSecurityContextResource } from '@/client/model/InteractiveFlowSessionSecurityContextResource'
import { isSuccess } from '@/client/SuccessApiResponse'
import { type ErrorApiResponse, getErrorMessage } from '@/client/ErrorApiResponse'

export const useInteractiveFlowSessionSecurityContextStore = defineStore(
  'interactiveFlowSessionSecurityContexts',
  () => {
    const api = new InteractiveFlowSessionApi()

    const securityContexts = ref<InteractiveFlowSessionSecurityContextResource[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const page = ref(0)
    const size = ref(20)
    const total = ref(0)

    const totalPages = computed(() => Math.ceil(total.value / size.value))

    async function fetchSecurityContexts(
      sessionId: string,
      requestedPage: number = 0
    ): Promise<void> {
      loading.value = true
      error.value = null

      const response = await api.listSessionSecurityContexts(sessionId, {
        page: requestedPage,
        size: size.value
      })

      if (isSuccess(response)) {
        securityContexts.value = response.content.security_contexts
        page.value = response.content.page
        total.value = response.content.total
      } else {
        error.value = getErrorMessage(response as ErrorApiResponse)
        securityContexts.value = []
      }

      loading.value = false
    }

    function $reset() {
      securityContexts.value = []
      loading.value = false
      error.value = null
      page.value = 0
      total.value = 0
    }

    return {
      securityContexts,
      loading,
      error,
      page,
      size,
      total,
      totalPages,
      fetchSecurityContexts,
      $reset
    }
  }
)
