import type { JSONSchemaType } from 'ajv'

/**
 * One place an interactive flow session was driven from, deduplicated on the address and the user
 * agent rather than appended per request.
 *
 * Every field but the address and the two dates is the word of the edge in front of the server, and
 * is present only where that edge sent it.
 */
export type InteractiveFlowSessionSecurityContextResource = {
  ip: string
  user_agent?: string | null
  country_code?: string | null
  region_code?: string | null
  region?: string | null
  city?: string | null
  time_zone?: string | null
  first_seen_date: string
  last_seen_date: string
  /** How many requests of the session came from here. */
  observation_count: number
  /**
   * When a credential was last proven from here. Absent for a place only requests were seen from —
   * which anybody holding the session's state can produce.
   */
  proven_date?: string | null
}

export const interactiveFlowSessionSecurityContextResourceSchema: JSONSchemaType<InteractiveFlowSessionSecurityContextResource> =
  {
    type: 'object',
    properties: {
      ip: {
        type: 'string'
      },
      user_agent: {
        type: 'string',
        nullable: true
      },
      country_code: {
        type: 'string',
        nullable: true
      },
      region_code: {
        type: 'string',
        nullable: true
      },
      region: {
        type: 'string',
        nullable: true
      },
      city: {
        type: 'string',
        nullable: true
      },
      time_zone: {
        type: 'string',
        nullable: true
      },
      first_seen_date: {
        type: 'string'
      },
      last_seen_date: {
        type: 'string'
      },
      observation_count: {
        type: 'number'
      },
      proven_date: {
        type: 'string',
        nullable: true
      }
    },
    required: ['ip', 'first_seen_date', 'last_seen_date', 'observation_count'],
    additionalProperties: true
  }

/**
 * Where the edge placed the address, from the narrowest word it sent to the widest. Null where it
 * placed it nowhere, which is every deployment without a geo profile.
 */
export function securityContextLocation(
  context: InteractiveFlowSessionSecurityContextResource
): string | null {
  const parts = [context.city, context.region ?? context.region_code, context.country_code].filter(
    (part) => part != null && part !== ''
  )
  return parts.length > 0 ? parts.join(', ') : null
}
