import type { JSONSchemaType } from 'ajv'
import { type ClaimResource, claimResourceSchema } from '@/client/model/ClaimResource'

export type ClaimListResource = {
  claims: ClaimResource[]
  page: number
  size: number
  total: number
}

export const claimListResourceSchema: JSONSchemaType<ClaimListResource> = {
  type: 'object',
  properties: {
    claims: {
      type: 'array',
      items: { ...claimResourceSchema },
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
  required: ['claims', 'page', 'size', 'total'],
  additionalProperties: true,
}
