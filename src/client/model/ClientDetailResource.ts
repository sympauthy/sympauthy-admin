import type { JSONSchemaType } from 'ajv'

export type ClientAuthorizationWebhookResource = {
  url: string
  on_failure: string
}

export type ClientDetailResource = {
  client_id: string
  type: string
  audience_id: string
  allowed_scopes: string[]
  default_scopes: string[]
  allowed_redirect_uris?: string[]
  allowed_grant_types: string[]
  authorization_flow_id?: string | null
  authorization_webhook?: ClientAuthorizationWebhookResource | null
}

const clientAuthorizationWebhookResourceSchema: JSONSchemaType<ClientAuthorizationWebhookResource> =
  {
    type: 'object',
    properties: {
      url: { type: 'string' },
      on_failure: { type: 'string' }
    },
    required: ['url', 'on_failure'],
    additionalProperties: true
  }

export const clientDetailResourceSchema: JSONSchemaType<ClientDetailResource> = {
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
    allowed_scopes: {
      type: 'array',
      items: { type: 'string' }
    },
    default_scopes: {
      type: 'array',
      items: { type: 'string' }
    },
    allowed_redirect_uris: {
      type: 'array',
      items: { type: 'string' },
      nullable: true
    },
    allowed_grant_types: {
      type: 'array',
      items: { type: 'string' }
    },
    authorization_flow_id: {
      type: 'string',
      nullable: true
    },
    authorization_webhook: {
      ...clientAuthorizationWebhookResourceSchema,
      nullable: true
    }
  },
  required: [
    'client_id',
    'type',
    'audience_id',
    'allowed_scopes',
    'default_scopes',
    'allowed_grant_types'
  ],
  additionalProperties: true
}
