import type { JSONSchemaType } from 'ajv'

export type ClaimResource = {
  id: string
  type: string
  origin: string
  enabled: boolean
  required: boolean
  identifier: boolean
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
    origin: {
      type: 'string',
    },
    enabled: {
      type: 'boolean',
    },
    required: {
      type: 'boolean',
    },
    identifier: {
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
  required: ['id', 'type', 'origin', 'enabled', 'required', 'identifier'],
  additionalProperties: true,
}
