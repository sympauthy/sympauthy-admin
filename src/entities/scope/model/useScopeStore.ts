import { defineStore } from 'pinia'
import { useCollection } from '@/shared/collection'
import { ScopeApi } from '../api/ScopeApi'
import type { ScopeListResource } from './ScopeListResource'
import type { ScopeResource } from './ScopeResource'

export const useScopeStore = defineStore('scopes', () => {
  const api = new ScopeApi()

  const scopes = useCollection<ScopeResource, ScopeListResource>({
    capabilities: () => api.getScopeCapabilities(),
    page: (params) => api.listScopes(params),
    items: (content) => content.scopes
  })

  return { scopes }
})
