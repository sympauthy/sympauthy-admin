import type { JSONSchemaType } from 'ajv'

export type InvitationResource = {
  invitation_id: string
  token_prefix: string
  audience_id: string
  status: string
  claims?: Record<string, string | null> | null
  note?: string | null
  created_by: string
  created_at: string
  expires_at?: string | null
  user_id?: string | null
  used_at?: string | null
}

export const invitationResourceSchema: JSONSchemaType<InvitationResource> = {
  type: 'object',
  properties: {
    invitation_id: {
      type: 'string'
    },
    token_prefix: {
      type: 'string'
    },
    audience_id: {
      type: 'string'
    },
    status: {
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
    note: {
      type: 'string',
      nullable: true
    },
    created_by: {
      type: 'string'
    },
    created_at: {
      type: 'string'
    },
    expires_at: {
      type: 'string',
      nullable: true
    },
    user_id: {
      type: 'string',
      nullable: true
    },
    used_at: {
      type: 'string',
      nullable: true
    }
  },
  required: ['invitation_id', 'token_prefix', 'audience_id', 'status', 'created_by', 'created_at'],
  additionalProperties: true
}
