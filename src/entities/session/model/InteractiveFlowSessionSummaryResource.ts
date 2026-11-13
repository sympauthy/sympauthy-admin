import type { JSONSchemaType } from 'ajv'
import { type UserResource, userResourceSchema } from '@/entities/user/@x/session'
import {
  type ClientReferenceResource,
  clientReferenceResourceSchema
} from '@/entities/client/@x/session'
import { translateMessageOr } from '@/shared/i18n'

/**
 * One interactive flow session, as the listing shows it.
 *
 * The API omits what a session does not hold rather than sending a null, so every key a stalled
 * session lacks is optional here — those are the sessions this page exists for.
 */
export type InteractiveFlowSessionSummaryResource = {
  id: string
  status: string
  initiating_purpose: string
  current_purpose?: string | null
  client?: ClientReferenceResource | null
  signed_up: boolean
  user?: UserResource | null
  ip?: string | null
  user_agent?: string | null
  session_date: string
  expiration_date: string
}

export const interactiveFlowSessionSummaryResourceSchema: JSONSchemaType<InteractiveFlowSessionSummaryResource> =
  {
    type: 'object',
    properties: {
      id: {
        type: 'string'
      },
      status: {
        type: 'string'
      },
      initiating_purpose: {
        type: 'string'
      },
      current_purpose: {
        type: 'string',
        nullable: true
      },
      client: {
        ...clientReferenceResourceSchema,
        nullable: true
      },
      signed_up: {
        type: 'boolean'
      },
      user: {
        ...userResourceSchema,
        nullable: true
      },
      ip: {
        type: 'string',
        nullable: true
      },
      user_agent: {
        type: 'string',
        nullable: true
      },
      session_date: {
        type: 'string'
      },
      expiration_date: {
        type: 'string'
      }
    },
    required: [
      'id',
      'status',
      'initiating_purpose',
      'signed_up',
      'session_date',
      'expiration_date'
    ],
    additionalProperties: true
  }

/** Every status the server publishes. The filter dropdown is the only thing that enumerates them. */
export const interactiveFlowSessionStatuses = [
  'ongoing',
  'completed',
  'cancelled',
  'failed',
  'expired'
]

/**
 * Whether the session ended in a failure, which is the set carrying the error fields.
 *
 * An expiry is one: nothing refused anything, the person simply stopped, and the flow told them so
 * with a message of its own — so `expired` names a failure the same way `failed` does. Anything
 * reading those fields asks this rather than naming a status, since the set is the server's to
 * widen.
 */
export function interactiveFlowSessionEndedInFailure(status: string): boolean {
  return status === 'failed' || status === 'expired'
}

export function interactiveFlowSessionStatusColor(
  status: string
): 'blue' | 'green' | 'gray' | 'red' | 'yellow' {
  switch (status) {
    case 'ongoing':
      return 'blue'
    case 'completed':
      return 'green'
    case 'failed':
      return 'red'
    case 'expired':
      return 'yellow'
    default:
      return 'gray'
  }
}

export function interactiveFlowSessionStatusLabel(status: string): string {
  return translateMessageOr(`terms.interactiveFlowSession.status.values.${status}`, status)
}
