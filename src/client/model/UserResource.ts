import type { JSONSchemaType } from 'ajv'

export type UserResource = {
  user_id: string
  claims?: Record<string, string> | null
  status: string
  created_at: string
}

export const userResourceSchema: JSONSchemaType<UserResource> = {
  type: 'object',
  properties: {
    user_id: {
      type: 'string',
    },
    claims: {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
      required: [],
      nullable: true,
    },
    status: {
      type: 'string',
    },
    created_at: {
      type: 'string',
    },
  },
  required: ['user_id', 'status', 'created_at'],
  additionalProperties: true,
}
