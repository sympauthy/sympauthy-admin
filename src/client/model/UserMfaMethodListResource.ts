import type { JSONSchemaType } from 'ajv'
import { type UserMfaMethodResource, userMfaMethodResourceSchema } from '@/client/model/UserMfaMethodResource'

export type UserMfaMethodListResource = {
  mfa_methods: UserMfaMethodResource[]
  page: number
  size: number
  total: number
}

export const userMfaMethodListResourceSchema: JSONSchemaType<UserMfaMethodListResource> = {
  type: 'object',
  properties: {
    mfa_methods: {
      type: 'array',
      items: { ...userMfaMethodResourceSchema },
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
  required: ['mfa_methods', 'page', 'size', 'total'],
  additionalProperties: true,
}
