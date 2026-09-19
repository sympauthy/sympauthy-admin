import type { JSONSchemaType } from 'ajv'

export type UserDetailResource = {
  user_id: string
  identifier_claims?: Record<string, string | number | null> | null
  status: string
  created_at: string
}

export const userDetailResourceSchema: JSONSchemaType<UserDetailResource> = {
  type: 'object',
  properties: {
    user_id: {
      type: 'string'
    },
    identifier_claims: {
      type: 'object',
      additionalProperties: {
        oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'null' }]
      } as any,
      required: [],
      nullable: true
    },
    status: {
      type: 'string'
    },
    created_at: {
      type: 'string'
    }
  },
  required: ['user_id', 'status', 'created_at'],
  additionalProperties: true
}
