import type { JSONSchemaType } from 'ajv'
import { type GrantSummaryResource, grantSummaryResourceSchema } from './GrantSummaryResource'

export type GrantListResource = {
  grants: GrantSummaryResource[]
  page: number
  size: number
  total: number
}

export const grantListResourceSchema: JSONSchemaType<GrantListResource> = {
  type: 'object',
  properties: {
    grants: {
      type: 'array',
      items: { ...grantSummaryResourceSchema }
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
  required: ['grants', 'page', 'size', 'total'],
  additionalProperties: true
}
