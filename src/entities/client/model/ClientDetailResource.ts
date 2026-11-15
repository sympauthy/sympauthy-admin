import type { JSONSchemaType } from 'ajv'

export type ClientAuthorizationWebhookResource = {
  url: string
  on_failure: string
}

export type ClientDetailResource = {
  client_id: string
  display_name?: string | null
  type: string
  audience_id: string
  allowed_scopes?: string[]
  default_scopes: string[]
  allowed_redirect_uris?: string[]
  return_uri?: string | null
  allowed_return_uris: string[]
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
    allowed_scopes: {
      type: 'array',
      items: { type: 'string' },
      nullable: true
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
    return_uri: {
      type: 'string',
      nullable: true
    },
    allowed_return_uris: {
      type: 'array',
      items: { type: 'string' }
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
    'default_scopes',
    'allowed_return_uris',
    'allowed_grant_types'
  ],
  additionalProperties: true
}

/**
 * Whether the configuration restricts the scopes `client` may ask for.
 *
 * The server publishes no `allowed_scopes` for a client it restricts in no way, and an empty list
 * for one allowed none — the two the panel draws as every scope and as no scope at all.
 */
export function clientRestrictsScopes(client: ClientDetailResource): boolean {
  return client.allowed_scopes != null
}

/**
 * Whether `client` asks for every scope it is allowed when a request names none: the configuration
 * restricts its scopes, and its default ones are those same scopes, in whatever order.
 */
export function clientDefaultsToAllowedScopes(client: ClientDetailResource): boolean {
  const allowed = client.allowed_scopes
  if (allowed == null || allowed.length === 0) {
    return false
  }
  const defaults = new Set(client.default_scopes)
  return defaults.size === new Set(allowed).size && allowed.every((scope) => defaults.has(scope))
}

/**
 * The pages a flow started for `client`, such as an MFA enrollment, may return a person to: its
 * `return_uri` first, the one the server falls back on when a request names none, then the others it
 * allows. Empty when the configuration declares none, and the server refuses to start such a flow.
 */
export function clientReturnUris(client: ClientDetailResource): string[] {
  return client.return_uri
    ? [client.return_uri, ...client.allowed_return_uris]
    : client.allowed_return_uris
}
