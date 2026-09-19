import type { JSONSchemaType } from 'ajv'

export type UserResource = {
  user_id: string
  /**
   * A claim is published with the type it is declared under, so a `number` claim arrives as a JSON
   * number and not as a string. A schema accepting strings alone would reject the whole response
   * over one such claim.
   */
  claims?: Record<string, string | number | boolean | null> | null
  status: string
  created_at: string
}

export const userResourceSchema: JSONSchemaType<UserResource> = {
  type: 'object',
  properties: {
    user_id: {
      type: 'string'
    },
    claims: {
      type: 'object',
      additionalProperties: {
        oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }, { type: 'null' }]
      } as any,
      required: [],
      nullable: true
    },
    status: {
      type: 'string'
    },
    created_at: {
      type: 'string'
    }
  },
  required: ['user_id', 'status', 'created_at'],
  additionalProperties: true
}

/**
 * The first claim the API embedded for the user, falling back to their identifier: a UUID is not
 * something an operator reads a person off, but it beats an empty cell.
 *
 * Which claims are in the map is the caller's business — a session embeds the identifier claims and
 * nothing else, which is what makes the first of them a name for the person.
 */
export function userIdentifierLabel(user: UserResource): string {
  const identifier = Object.values(user.claims ?? {}).find((value) => value != null && value !== '')
  return identifier != null ? String(identifier) : user.user_id
}
