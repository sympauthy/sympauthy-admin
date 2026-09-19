import type { JSONSchemaType } from 'ajv'

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
