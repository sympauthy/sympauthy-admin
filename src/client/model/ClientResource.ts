import type { JSONSchemaType } from 'ajv'

export type ClientResource = {
  client_id: string
  allowed_scopes: string[]
  default_scopes: string[]
  allowed_redirect_uris?: string[]
}

export const clientResourceSchema: JSONSchemaType<ClientResource> = {
  type: 'object',
  properties: {
    client_id: {
      type: 'string',
    },
    allowed_scopes: {
      type: 'array',
      items: { type: 'string' },
    },
    default_scopes: {
      type: 'array',
      items: { type: 'string' },
    },
    allowed_redirect_uris: {
      type: 'array',
      items: { type: 'string' },
      nullable: true,
    },
  },
  required: ['client_id', 'allowed_scopes', 'default_scopes'],
  additionalProperties: true,
}
