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
 * The error identifiers are message keys and are published unrendered on purpose: a key is something
 * an operator can grep the server for, where a sentence in the wrong locale tells them less.
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
  /** Absent unless the session failed. */
  error_details_id?: string | null
  error_description_id?: string | null
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
      error_description_id: {
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
