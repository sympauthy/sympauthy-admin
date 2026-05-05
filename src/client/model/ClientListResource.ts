import type { JSONSchemaType } from 'ajv'
import {
  type ClientSummaryResource,
  clientSummaryResourceSchema
} from '@/client/model/ClientSummaryResource'

export type ClientListResource = {
  clients: ClientSummaryResource[]
  page: number
  size: number
  total: number
}

export const clientListResourceSchema: JSONSchemaType<ClientListResource> = {
  type: 'object',
  properties: {
    clients: {
      type: 'array',
      items: { ...clientSummaryResourceSchema }
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
  required: ['clients', 'page', 'size', 'total'],
  additionalProperties: true
}
