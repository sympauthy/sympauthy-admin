import type { JSONSchemaType } from 'ajv'

export type UserMfaMethodResource = {
  mfa_id: string
  type: string
  registered_at: string
}

export const userMfaMethodResourceSchema: JSONSchemaType<UserMfaMethodResource> = {
  type: 'object',
  properties: {
    mfa_id: {
      type: 'string'
    },
    type: {
      type: 'string'
    },
    registered_at: {
      type: 'string'
    }
  },
  required: ['mfa_id', 'type', 'registered_at'],
  additionalProperties: true
}
