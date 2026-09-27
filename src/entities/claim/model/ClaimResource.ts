import type { JSONSchemaType } from 'ajv'

export type ClaimResource = {
  id: string
  type: string
  origin: string
  enabled: boolean
  required: boolean
  identifier: boolean
  allowed_values?: (string | number | boolean)[]
  group?: string
}

export const claimResourceSchema: JSONSchemaType<ClaimResource> = {
  type: 'object',
  properties: {
    id: {
      type: 'string'
    },
    type: {
      type: 'string'
    },
    origin: {
      type: 'string'
    },
    enabled: {
      type: 'boolean'
    },
    required: {
      type: 'boolean'
    },
    identifier: {
      type: 'boolean'
    },
    // A value is published with the type its claim is declared under, so the allowed values of a
    // `number` claim arrive as JSON numbers and those of a `boolean` one as JSON booleans. A schema
    // naming strings alone would reject the whole response over one such claim.
    allowed_values: {
      type: 'array',
      items: { oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }] },
      nullable: true
    },
    group: {
      type: 'string',
      nullable: true
    }
  },
  required: ['id', 'type', 'origin', 'enabled', 'required', 'identifier'],
  additionalProperties: true
}
