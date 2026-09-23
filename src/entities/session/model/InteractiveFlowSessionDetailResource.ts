import type { JSONSchemaType } from 'ajv'
import { type UserResource, userResourceSchema } from '@/entities/user/@x/session'
import {
  type InteractiveFlowPurposeResource,
  interactiveFlowPurposeResourceSchema
} from '@/entities/session/model/InteractiveFlowPurposeResource'
import {
  type InteractiveFlowSessionPurposeProgressResource,
  interactiveFlowSessionPurposeProgressResourceSchema
} from '@/entities/session/model/InteractiveFlowSessionPurposeProgressResource'

/**
 * One interactive flow session, every purpose it carries and where each one stands.
 *
 * A failure is published twice over: the identifiers are the message keys themselves, which is what
 * an operator greps the server for and what a caller may branch on, and beside each one is the
 * sentence it was read under, rendered in the language the request asked for. A sentence is absent
 * where this deployment holds no message under the identifier beside it — a session outlives a key
 * that was renamed — so an identifier arriving alone is expected and is not a fetch that went wrong.
 */
export type InteractiveFlowSessionDetailResource = {
  id: string
  /** One of `ongoing`, `completed`, `cancelled`, `failed` or `expired`. */
  status: string
  initiating_purpose: InteractiveFlowPurposeResource
  /** Absent where an administrator started the session and where nothing named a client. */
  client_id?: string | null
  flow_id?: string | null
  /** Absent where the session identified nobody, and while it is still signing an account up. */
  user?: UserResource | null
  signed_up: boolean
  session_date: string
  expiration_date: string
  /**
   * Absent unless the session ended in a failure — one it failed with, or the expiry that ended it.
   */
  error_details_id?: string | null
  /** The technical message. Absent where this deployment holds nothing under `error_details_id`. */
  error_details?: string | null
  /**
   * Identifier of the message the end-user was shown, which is the failure's own where it names one
   * and the generic message's otherwise — so it names what the person was actually told.
   */
  error_description_id?: string | null
  /** The end-user's message. Absent where this deployment holds nothing under its identifier. */
  error_description?: string | null
  error_values?: Record<string, string> | null
  purposes: InteractiveFlowSessionPurposeProgressResource[]
}

export const interactiveFlowSessionDetailResourceSchema: JSONSchemaType<InteractiveFlowSessionDetailResource> =
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
      client_id: {
        type: 'string',
        nullable: true
      },
      flow_id: {
        type: 'string',
        nullable: true
      },
      user: {
        ...userResourceSchema,
        nullable: true
      },
      signed_up: {
        type: 'boolean'
      },
      session_date: {
        type: 'string'
      },
      expiration_date: {
        type: 'string'
      },
      error_details_id: {
        type: 'string',
        nullable: true
      },
      error_details: {
        type: 'string',
        nullable: true
      },
      error_description_id: {
        type: 'string',
        nullable: true
      },
      error_description: {
        type: 'string',
        nullable: true
      },
      error_values: {
        type: 'object',
        additionalProperties: {
          type: 'string'
        },
        required: [],
        nullable: true
      },
      purposes: {
        type: 'array',
        items: { ...interactiveFlowSessionPurposeProgressResourceSchema }
      }
    },
    required: [
      'id',
      'status',
      'initiating_purpose',
      'signed_up',
      'session_date',
      'expiration_date',
      'purposes'
    ],
    additionalProperties: true
  }
