import type { JSONSchemaType } from 'ajv'
import { translateMessageOr } from '@/shared/i18n'

export type ClaimResource = {
  id: string
  type: string
  origin: string
  kind?: string
  enabled: boolean
  required: boolean
  identifier: boolean
  allowed_values?: (string | number | boolean)[]
  group?: string
  published_in: string[]
}

/**
 * One value a claim restricts its own to, as a schema.
 *
 * A value is published with the type its claim is declared under, so the allowed values of a
 * `number` claim arrive as JSON numbers and those of a `boolean` one as JSON booleans. A schema
 * naming strings alone would reject the whole response over one such claim.
 */
const claimAllowedValueSchema = {
  oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }]
} as const

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
    kind: {
      type: 'string',
      nullable: true
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
      items: { ...claimAllowedValueSchema },
      nullable: true
    },
    group: {
      type: 'string',
      nullable: true
    },
    published_in: {
      type: 'array',
      items: { type: 'string' }
    }
  },
  required: ['id', 'type', 'origin', 'enabled', 'required', 'identifier', 'published_in'],
  additionalProperties: true
}

/**
 * Label a publication place is read under. Branching happens on the wire value and never on the
 * label: the set is the server's, and a release may add a place to it.
 *
 * The translation wins where this admin panel knows the value, and the wire value itself is what a
 * person reads otherwise — so a place added on the server before the panel knows about it still
 * renders rather than leaving a gap in the row.
 */
export function claimPublicationPlaceLabel(place: string): string {
  return translateMessageOr(`common.claimPublicationPlace.${place}`, place)
}

/**
 * Label a kind is read under, by `claimPublicationPlaceLabel`'s rule: the set is the server's, a
 * release may add a kind to it, and a value this panel holds no translation for renders as itself.
 *
 * It takes the value rather than the claim because a claim of neither kind carries none, and a
 * cell with nothing to name is an `EmptyValue` rather than a label of its own.
 */
export function claimKindLabel(kind: string): string {
  return translateMessageOr(`common.claimKind.${kind}`, kind)
}
