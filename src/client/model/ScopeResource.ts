import type { JSONSchemaType } from 'ajv'

export type ScopeResource = {
  id: string
  type: string
  origin: string
  enabled: boolean
  claims?: string[]
}

export const scopeResourceSchema: JSONSchemaType<ScopeResource> = {
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
    claims: {
      type: 'array',
      items: { type: 'string' },
      nullable: true,
    },
  },
  required: ['id', 'type', 'origin', 'enabled'],
  additionalProperties: true,
}
