import type { JSONSchemaType } from 'ajv'

/**
 * A client as a record names it: a grant, an interactive flow session, a consent. The record
 * outlives the configuration, so the client it names may no longer be declared, and is then named
 * by its identifier alone.
 */
export type ClientReferenceResource = {
  id: string
  display_name?: string | null
}

export const clientReferenceResourceSchema: JSONSchemaType<ClientReferenceResource> = {
  type: 'object',
  properties: {
    id: {
      type: 'string'
    },
    display_name: {
      type: 'string',
      nullable: true
    }
  },
  required: ['id'],
  additionalProperties: true
}

/**
 * What an operator reads a client as: the display name the configuration gives it, or its
 * identifier where it gives none.
 */
export function clientName(id: string, displayName: string | null | undefined): string {
  return displayName || id
}

/**
 * {@link clientName} of the client a record names.
 */
export function clientReferenceName(client: ClientReferenceResource): string {
  return clientName(client.id, client.display_name)
}
