import type { JSONSchemaType } from 'ajv'
import { translateMessage } from '@/shared/i18n'

export type UserClaimResource = {
  claim_id: string
  value?: string | number | boolean | null
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
 * A claim is published with the type it is declared under, so a `boolean` claim arrives as a JSON
 * boolean and a `number` one as a JSON number. A schema naming fewer of them would reject the whole
 * page over one such claim.
 *
 * AJV's `JSONSchemaType` cannot type a union that includes null, so this one is written plainly and
 * declared past it. The looseness is the schema's type and not the schema: what it validates is
 * every case the field holds and nothing else.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const claimValueSchema: any = {
  oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }, { type: 'null' }]
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

/**
 * How the value held for a claim reads: a boolean as the *Yes* and *No* the panel names, since those
 * are words it owns rather than values the server sends, and anything else as it arrived.
 *
 * A claim nothing was collected for holds no value, and the cell showing one draws an `EmptyValue`
 * rather than asking this for a label.
 */
export function userClaimValueLabel(claim: UserClaimResource): string {
  if (typeof claim.value === 'boolean') {
    return translateMessage(claim.value ? 'common.yes' : 'common.no')
  }
  return claim.value == null ? '' : String(claim.value)
}
