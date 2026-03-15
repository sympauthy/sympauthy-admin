import type { JSONSchemaType } from 'ajv'

export type UserClaimResource = {
  claim_id: string
  value: string | null
  type: string
  standard: boolean
  required: boolean
  identifier: boolean
  group: string | null
  collected_at: string | null
  verified_at: string | null
}

export const userClaimResourceSchema: JSONSchemaType<UserClaimResource> = {
  type: 'object',
  properties: {
    claim_id: {
      type: 'string',
    },
    value: {
      type: 'string',
      nullable: true,
    },
    type: {
      type: 'string',
    },
    standard: {
      type: 'boolean',
    },
    required: {
      type: 'boolean',
    },
    identifier: {
      type: 'boolean',
    },
    group: {
      type: 'string',
      nullable: true,
    },
    collected_at: {
      type: 'string',
      nullable: true,
    },
    verified_at: {
      type: 'string',
      nullable: true,
    },
  },
  required: ['claim_id', 'value', 'type', 'standard', 'required', 'identifier', 'group', 'collected_at', 'verified_at'],
  additionalProperties: true,
}
