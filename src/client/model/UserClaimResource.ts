import type { JSONSchemaType } from 'ajv'

export type UserClaimResource = {
  claim_id: string
  value?: string | null
  type: string
  origin: string
  required: boolean
  identifier: boolean
  group?: string | null
  collected_at?: string | null
  verified_at?: string | null
}

export const userClaimResourceSchema: JSONSchemaType<UserClaimResource> = {
  type: 'object',
  properties: {
    claim_id: {
      type: 'string'
    },
    value: {
      type: 'string',
      nullable: true
    },
    type: {
      type: 'string'
    },
    origin: {
      type: 'string'
    },
    required: {
      type: 'boolean'
    },
    identifier: {
      type: 'boolean'
    },
    group: {
      type: 'string',
      nullable: true
    },
    collected_at: {
      type: 'string',
      nullable: true
    },
    verified_at: {
      type: 'string',
      nullable: true
    }
  },
  required: ['claim_id', 'type', 'origin', 'required', 'identifier'],
  additionalProperties: true
}
