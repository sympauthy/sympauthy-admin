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

/**
 * One value a claim admits, as a schema.
 *
 * A value is published with the type its claim is declared under, so the allowed values of a
 * `number` claim arrive as JSON numbers and those of a `boolean` one as JSON booleans. A schema
 * naming strings alone would reject the whole response over one such claim.
 *
 * AJV's `JSONSchemaType` cannot type a union, so this one is written plainly and declared past it.
 * The looseness is the schema's type and not the schema: what it validates is every case the field
 * holds and nothing else.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const allowedValueSchema: any = {
  oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }]
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
    allowed_values: {
      type: 'array',
      items: allowedValueSchema,
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
