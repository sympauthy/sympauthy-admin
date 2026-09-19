import { defineStore } from 'pinia'
import { useCollection } from '@/shared/collection'
import { InteractiveFlowSessionApi } from '../api/InteractiveFlowSessionApi'
import type { InteractiveFlowSessionListResource } from './InteractiveFlowSessionListResource'
import type { InteractiveFlowSessionSummaryResource } from './InteractiveFlowSessionSummaryResource'

export const useInteractiveFlowSessionStore = defineStore('interactiveFlowSessions', () => {
  const api = new InteractiveFlowSessionApi()

  const sessions = useCollection<
    InteractiveFlowSessionSummaryResource,
    InteractiveFlowSessionListResource
  >({
    capabilities: () => api.getSessionCapabilities(),
    page: (params) => api.listSessions(params),
    items: (content) => content.sessions
  })

  return { sessions }
})
