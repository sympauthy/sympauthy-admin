import type { JSONSchemaType } from 'ajv'
import { type ClientResource, clientResourceSchema } from '@/client/model/ClientResource'

export type ClientListResource = {
  clients: ClientResource[]
  page: number
  size: number
  total: number
}

export const clientListResourceSchema: JSONSchemaType<ClientListResource> = {
  type: 'object',
  properties: {
    clients: {
      type: 'array',
      items: { ...clientResourceSchema },
    },
    page: {
      type: 'number',
    },
    size: {
      type: 'number',
    },
    total: {
      type: 'number',
    },
  },
  required: ['clients', 'page', 'size', 'total'],
  additionalProperties: true,
}
