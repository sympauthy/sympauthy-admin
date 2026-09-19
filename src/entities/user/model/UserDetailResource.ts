import type { JSONSchemaType } from 'ajv'

export type UserDetailResource = {
  user_id: string
  identifier_claims?: Record<string, string | number | null> | null
  status: string
  created_at: string
}

/**
 * A claim value an account is identified by, as a schema.
 *
 * AJV's `JSONSchemaType` cannot type a union that includes null, so this one is written plainly and
 * declared past it. The looseness is the schema's type and not the schema: what it validates is
 * every case the field holds and nothing else.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const identifierClaimValueSchema: any = {
  oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'null' }]
}

export const userDetailResourceSchema: JSONSchemaType<UserDetailResource> = {
  type: 'object',
  properties: {
    user_id: {
      type: 'string'
    },
    identifier_claims: {
      type: 'object',
      additionalProperties: identifierClaimValueSchema,
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
