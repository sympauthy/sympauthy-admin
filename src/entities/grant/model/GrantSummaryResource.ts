import type { JSONSchemaType } from 'ajv'
import { translateMessageOr } from '@/shared/i18n'

export type GrantSummaryResource = {
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
  actor_grant_id?: string | null
}

export const grantSummaryResourceSchema: JSONSchemaType<GrantSummaryResource> = {
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
    actor_grant_id: {
      type: 'string',
      nullable: true
    }
  },
  required: ['grant_id', 'client_id', 'audience_id', 'grant_type', 'status', 'created_at'],
  additionalProperties: true
}

/**
 * Whether a revocation made now would reach the grant. Only a live grant is offered for revoking:
 * the server leaves any other as it is, so the action would answer that it revoked nothing.
 */
export function grantIsLive(grant: Pick<GrantSummaryResource, 'status'>): boolean {
  return grant.status === 'live'
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
