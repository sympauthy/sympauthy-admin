import type { JSONSchemaType } from 'ajv'

export type UserClaimResource = {
  claim_id: string
  value?: string | number | null
  type: string
  origin: string
  required: boolean
  identifier: boolean
  group?: string | null
  collected_at?: string | null
  verified_at?: string | null
}

/**
 * The value collected for a claim, as a schema.
 *
 * AJV's `JSONSchemaType` cannot type a union that includes null, so this one is written plainly and
 * declared past it. The looseness is the schema's type and not the schema: what it validates is
 * every case the field holds and nothing else.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const claimValueSchema: any = {
  oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'null' }]
}

export const userClaimResourceSchema: JSONSchemaType<UserClaimResource> = {
  type: 'object',
  properties: {
    claim_id: {
      type: 'string'
    },
    value: claimValueSchema,
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
