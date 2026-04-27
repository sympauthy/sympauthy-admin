import type { JSONSchemaType } from 'ajv'
import { type ScopeResource, scopeResourceSchema } from '@/client/model/ScopeResource'

export type ScopeListResource = {
  scopes: ScopeResource[]
  page: number
  size: number
  total: number
}

export const scopeListResourceSchema: JSONSchemaType<ScopeListResource> = {
  type: 'object',
  properties: {
    scopes: {
      type: 'array',
      items: { ...scopeResourceSchema }
    },
    page: {
      type: 'number'
    },
    size: {
      type: 'number'
    },
    total: {
      type: 'number'
    }
  },
  required: ['scopes', 'page', 'size', 'total'],
  additionalProperties: true
}
