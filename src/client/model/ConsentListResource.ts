import type { JSONSchemaType } from 'ajv'
import { type ConsentResource, consentResourceSchema } from '@/client/model/ConsentResource'

export type ConsentListResource = {
  consents: ConsentResource[]
  page: number
  size: number
  total: number
}

export const consentListResourceSchema: JSONSchemaType<ConsentListResource> = {
  type: 'object',
  properties: {
    consents: {
      type: 'array',
      items: { ...consentResourceSchema },
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
  required: ['consents', 'page', 'size', 'total'],
  additionalProperties: true,
}
