import type { JSONSchemaType } from 'ajv'
import { type UserResource, userResourceSchema } from '@/client/model/UserResource'

export type UserListResource = {
  users: UserResource[]
  page: number
  size: number
  total: number
}

export const userListResourceSchema: JSONSchemaType<UserListResource> = {
  type: 'object',
  properties: {
    users: {
      type: 'array',
      items: { ...userResourceSchema },
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
  required: ['users', 'page', 'size', 'total'],
  additionalProperties: true,
}
