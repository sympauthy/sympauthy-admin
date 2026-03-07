import type { JSONSchemaType } from 'ajv'

export type ClaimResource = {
  id: string
  type: string
  standard: boolean
  enabled: boolean
  required: boolean
  allowed_values?: string[]
  group?: string
}

export const claimResourceSchema: JSONSchemaType<ClaimResource> = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
    },
    type: {
      type: 'string',
    },
    standard: {
      type: 'boolean',
    },
    enabled: {
      type: 'boolean',
    },
    required: {
      type: 'boolean',
    },
    allowed_values: {
      type: 'array',
      items: { type: 'string' },
      nullable: true,
    },
    group: {
      type: 'string',
      nullable: true,
    },
  },
  required: ['id', 'type', 'standard', 'enabled', 'required'],
  additionalProperties: true,
}
