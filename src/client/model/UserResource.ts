import type { JSONSchemaType } from 'ajv'

export type UserResource = {
  user_id: string
  claims?: Record<string, string | null> | null
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
        type: 'string',
        nullable: true
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
 * The first identifier claim the user can be recognised by, falling back to their identifier: a
 * UUID is not something an operator reads a person off, but it beats an empty cell.
 */
export function userIdentifierLabel(user: UserResource): string {
  const identifier = Object.values(user.claims ?? {}).find((value) => value != null && value !== '')
  return identifier != null ? String(identifier) : user.user_id
}
