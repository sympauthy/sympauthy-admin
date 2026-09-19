import type { JSONSchemaType } from 'ajv'
import { type UserResource, userResourceSchema } from '@/client/model/UserResource'
import {
  type InteractiveFlowPurposeResource,
  interactiveFlowPurposeResourceSchema
} from '@/client/model/InteractiveFlowPurposeResource'
import { translateMessageOr } from '@/i18n'

/**
 * One interactive flow session, as the listing shows it.
 *
 * The API omits what a session does not hold rather than sending a null, so every key a stalled
 * session lacks is optional here — those are the sessions this page exists for.
 */
export type InteractiveFlowSessionSummaryResource = {
  id: string
  /** One of `ongoing`, `completed`, `cancelled`, `failed` or `expired`. */
  status: string
  initiating_purpose: InteractiveFlowPurposeResource
  /** Absent on a terminal session, which is stopped at no purpose. */
  current_purpose?: InteractiveFlowPurposeResource | null
  /** Absent where an administrator started the session and where nothing named a client. */
  client_id?: string | null
  signed_up: boolean
  /** Absent where the session identified nobody, and while it is still signing an account up. */
  user?: UserResource | null
  /** Absent where the session holds no observation. */
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
      initiating_purpose: { ...interactiveFlowPurposeResourceSchema },
      current_purpose: {
        ...interactiveFlowPurposeResourceSchema,
        nullable: true
      },
      client_id: {
        type: 'string',
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
  return translateMessageOr(`common.interactiveFlowSessionStatus.${status}`, status)
}
