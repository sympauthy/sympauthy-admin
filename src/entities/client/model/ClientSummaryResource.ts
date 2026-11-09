import type { JSONSchemaType } from 'ajv'
import { translateMessageOr } from '@/shared/i18n'

export type ClientSummaryResource = {
  client_id: string
  type: string
  audience_id: string
  allowed_redirect_uris?: string[]
}

export const clientSummaryResourceSchema: JSONSchemaType<ClientSummaryResource> = {
  type: 'object',
  properties: {
    client_id: {
      type: 'string'
    },
    type: {
      type: 'string'
    },
    audience_id: {
      type: 'string'
    },
    allowed_redirect_uris: {
      type: 'array',
      items: { type: 'string' },
      nullable: true
    }
  },
  required: ['client_id', 'type', 'audience_id'],
  additionalProperties: true
}

/**
 * Label a client's type is read under. The set is the server's, and a value this panel holds no
 * translation for renders as itself.
 */
export function clientTypeLabel(type: string): string {
  return translateMessageOr(`terms.client.type.values.${type}`, type)
}
