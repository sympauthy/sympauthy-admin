import type { JSONSchemaType } from 'ajv'
import { translateMessageOr } from '@/shared/i18n'

export type GrantRequestedClaimsResource = {
  id_token: string[]
  userinfo: string[]
}

export const grantRequestedClaimsResourceSchema: JSONSchemaType<GrantRequestedClaimsResource> = {
  type: 'object',
  properties: {
    id_token: {
      type: 'array',
      items: { type: 'string' }
    },
    userinfo: {
      type: 'array',
      items: { type: 'string' }
    }
  },
  required: ['id_token', 'userinfo'],
  additionalProperties: true
}

export type GrantDetailResource = {
  grant_id: string
  user_id?: string | null
  client_id: string
  audience_id: string
  grant_type: string
  status: string
  created_at: string
  expires_at?: string | null
  revoked_at?: string | null
  revoked_by?: string | null
  revoked_by_user_id?: string | null
  actor_grant_id?: string | null
  granted_scopes: string[]
  granted_at?: string | null
  granted_by?: string | null
  consented_scopes: string[]
  consented_at?: string | null
  consented_by?: string | null
  client_scopes: string[]
  authenticated_at?: string | null
  requested_claims?: GrantRequestedClaimsResource | null
}

export const grantDetailResourceSchema: JSONSchemaType<GrantDetailResource> = {
  type: 'object',
  properties: {
    grant_id: {
      type: 'string'
    },
    user_id: {
      type: 'string',
      nullable: true
    },
    client_id: {
      type: 'string'
    },
    audience_id: {
      type: 'string'
    },
    grant_type: {
      type: 'string'
    },
    status: {
      type: 'string'
    },
    created_at: {
      type: 'string'
    },
    expires_at: {
      type: 'string',
      nullable: true
    },
    revoked_at: {
      type: 'string',
      nullable: true
    },
    revoked_by: {
      type: 'string',
      nullable: true
    },
    revoked_by_user_id: {
      type: 'string',
      nullable: true
    },
    actor_grant_id: {
      type: 'string',
      nullable: true
    },
    granted_scopes: {
      type: 'array',
      items: { type: 'string' }
    },
    granted_at: {
      type: 'string',
      nullable: true
    },
    granted_by: {
      type: 'string',
      nullable: true
    },
    consented_scopes: {
      type: 'array',
      items: { type: 'string' }
    },
    consented_at: {
      type: 'string',
      nullable: true
    },
    consented_by: {
      type: 'string',
      nullable: true
    },
    client_scopes: {
      type: 'array',
      items: { type: 'string' }
    },
    authenticated_at: {
      type: 'string',
      nullable: true
    },
    requested_claims: {
      ...grantRequestedClaimsResourceSchema,
      nullable: true
    }
  },
  required: [
    'grant_id',
    'client_id',
    'audience_id',
    'grant_type',
    'status',
    'created_at',
    'granted_scopes',
    'consented_scopes',
    'client_scopes'
  ],
  additionalProperties: true
}

export function grantGrantedByLabel(grantedBy: string): string {
  return translateMessageOr(`terms.grant.grantedBy.values.${grantedBy}`, grantedBy)
}

export function grantConsentedByLabel(consentedBy: string): string {
  return translateMessageOr(`terms.grant.consentedBy.values.${consentedBy}`, consentedBy)
}
