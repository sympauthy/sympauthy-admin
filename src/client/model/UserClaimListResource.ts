import type { JSONSchemaType } from 'ajv'
import { type UserClaimResource, userClaimResourceSchema } from '@/client/model/UserClaimResource'

export type UserClaimListResource = {
  claims: UserClaimResource[]
  page: number
  size: number
  total: number
}

export const userClaimListResourceSchema: JSONSchemaType<UserClaimListResource> = {
  type: 'object',
  properties: {
    claims: {
      type: 'array',
      items: { ...userClaimResourceSchema },
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
