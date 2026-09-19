import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useCollection } from '@/shared/collection'
import { InteractiveFlowSessionApi } from '../api/InteractiveFlowSessionApi'
import type { InteractiveFlowSessionSecurityContextListResource } from './InteractiveFlowSessionSecurityContextListResource'
import type { InteractiveFlowSessionSecurityContextResource } from './InteractiveFlowSessionSecurityContextResource'

export const useInteractiveFlowSessionSecurityContextStore = defineStore(
  'interactiveFlowSessionSecurityContexts',
  () => {
    const api = new InteractiveFlowSessionApi()

    // The session whose places are read. The collection reads it at the moment it calls, so paging
    // and filtering stay on the record the page last asked for.
    const sessionId = ref('')

    const securityContexts = useCollection<
      InteractiveFlowSessionSecurityContextResource,
      InteractiveFlowSessionSecurityContextListResource
    >({
      capabilities: () => api.getSessionSecurityContextCapabilities(sessionId.value),
      page: (params) => api.listSessionSecurityContexts(sessionId.value, params),
      items: (content) => content.security_contexts
    })

    async function fetchSecurityContexts(id: string): Promise<void> {
      sessionId.value = id
      await securityContexts.fetch(0)
    }

    function $reset() {
      securityContexts.reset()
    }

    return { securityContexts, fetchSecurityContexts, $reset }
  }
)
