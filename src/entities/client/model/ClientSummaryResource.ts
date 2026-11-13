import type { JSONSchemaType } from 'ajv'
import { translateMessage, translateMessageOr } from '@/shared/i18n'
import type { ClientReferenceResource } from './ClientReferenceResource'

export type ClientSummaryResource = {
  client_id: string
  display_name?: string | null
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
    display_name: {
      type: 'string',
      nullable: true
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

/**
 * The client a resource of its own describes, as a record would name it, so that it is drawn by
 * the same rule.
 */
export function clientReference(
  client: Pick<ClientSummaryResource, 'client_id' | 'display_name'>
): ClientReferenceResource {
  return { id: client.client_id, display_name: client.display_name }
}

/**
 * What a client is offered under in a choice: its display name with its identifier beside it,
 * since nothing keeps two clients from sharing a name, or its identifier alone.
 */
export function clientChoiceLabel(
  client: Pick<ClientSummaryResource, 'client_id' | 'display_name'>
): string {
  return client.display_name
    ? translateMessage('common.clientChoice', { name: client.display_name, id: client.client_id })
    : client.client_id
}
