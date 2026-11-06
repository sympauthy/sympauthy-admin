import type { JSONSchemaType } from 'ajv'
import { translateMessageOr } from '@/shared/i18n'
import {
  type UserResource,
  userIdentifierLabel,
  userResourceSchema
} from '@/entities/user/@x/grant'

export type GrantSummaryResource = {
  grant_id: string
  user?: UserResource | null
  client_id: string
  audience_id: string
  grant_type: string
  status: string
  created_at: string
  expires_at?: string | null
  revoked_at?: string | null
  revoked_by?: string | null
  actor_grant_id?: string | null
  granted_scopes: string[]
  consented_scopes: string[]
  client_scopes: string[]
}

export const grantSummaryResourceSchema: JSONSchemaType<GrantSummaryResource> = {
  type: 'object',
  properties: {
    grant_id: {
      type: 'string'
    },
    user: {
      ...userResourceSchema,
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
    actor_grant_id: {
      type: 'string',
      nullable: true
    },
    granted_scopes: {
      type: 'array',
      items: { type: 'string' }
    },
    consented_scopes: {
      type: 'array',
      items: { type: 'string' }
    },
    client_scopes: {
      type: 'array',
      items: { type: 'string' }
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

/**
 * Whether a revocation made now would reach the grant. Only a live grant is offered for revoking:
 * the server leaves any other as it is, so the action would answer that it revoked nothing.
 */
export function grantIsLive(grant: Pick<GrantSummaryResource, 'status'>): boolean {
  return grant.status === 'live'
}

/**
 * What an operator calls a grant: the person it was opened for, by the first identifier claim the
 * server embeds for them, or the client a client credentials grant is held by alone.
 */
export function grantName(grant: Pick<GrantSummaryResource, 'user' | 'client_id'>): string {
  return grant.user ? userIdentifierLabel(grant.user) : grant.client_id
}

/**
 * How many scopes a grant holds, each counted once whichever of its sets — granted, consented to or
 * the client's own — it came through.
 */
export function grantScopeCount(
  grant: Pick<GrantSummaryResource, 'granted_scopes' | 'consented_scopes' | 'client_scopes'>
): number {
  return new Set([...grant.granted_scopes, ...grant.consented_scopes, ...grant.client_scopes]).size
}

export function grantStatusColor(status: string): 'green' | 'red' | 'yellow' | 'gray' {
  switch (status) {
    case 'live':
      return 'green'
    case 'revoked':
      return 'red'
    case 'expired':
      return 'yellow'
    default:
      return 'gray'
  }
}

export function grantStatusLabel(status: string): string {
  return translateMessageOr(`terms.grant.status.values.${status}`, status)
}

export function grantTypeLabel(grantType: string): string {
  return translateMessageOr(`terms.grant.type.values.${grantType}`, grantType)
}

export function grantRevokedByLabel(revokedBy: string): string {
  return translateMessageOr(`terms.grant.revokedBy.values.${revokedBy}`, revokedBy)
}
