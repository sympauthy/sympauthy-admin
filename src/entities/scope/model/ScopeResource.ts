import type { JSONSchemaType } from 'ajv'
import type { SaTagVariant } from '@sympauthy/design'
import { translateMessageOr } from '@/shared/i18n'

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
    claims: {
      type: 'array',
      items: { type: 'string' },
      nullable: true
    }
  },
  required: ['id', 'type', 'origin', 'enabled'],
  additionalProperties: true
}

/**
 * The kinds of scope, in the order a legend lists them: what the person consents to, what this
 * deployment's rules grant, and what belongs to the client itself.
 */
export const SCOPE_TYPES = ['consentable', 'grantable', 'client'] as const

/**
 * How every screen draws a scope of `type`, so that one scope reads alike on the scopes list and on
 * the records listing it. A grantable scope is ringed rather than filled, so that it differs from a
 * consentable one in more than hue, and a client scope takes ink, the strongest tag, as the kind set
 * furthest apart: no person is involved in it. A type this panel does not know is a grey tag.
 */
export function scopeTypeTag(type: string | undefined): {
  color: 'blue' | 'purple' | 'ink' | 'gray'
  variant: SaTagVariant
} {
  switch (type) {
    case 'consentable':
      return { color: 'blue', variant: 'fill' }
    case 'grantable':
      return { color: 'purple', variant: 'outline' }
    case 'client':
      return { color: 'ink', variant: 'fill' }
    default:
      return { color: 'gray', variant: 'fill' }
  }
}

/**
 * Label a type is read under, by `claimKindLabel`'s rule: the set is the server's, and a value this
 * panel holds no translation for renders as itself.
 */
export function scopeTypeLabel(type: string): string {
  return translateMessageOr(`terms.scope.type.values.${type}`, type)
}
