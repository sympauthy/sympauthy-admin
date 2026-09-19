import type { JSONSchemaType } from 'ajv'

export type CreatedInvitationResource = {
  invitation_id: string
  token: string
  audience_id: string
  status: string
  claims?: Record<string, string | null> | null
  note?: string | null
  created_at: string
  expires_at?: string | null
}

export const createdInvitationResourceSchema: JSONSchemaType<CreatedInvitationResource> = {
  type: 'object',
  properties: {
    invitation_id: {
      type: 'string'
    },
    token: {
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
    created_at: {
      type: 'string'
    },
    expires_at: {
      type: 'string',
      nullable: true
    }
  },
  required: ['invitation_id', 'token', 'audience_id', 'status', 'created_at'],
  additionalProperties: true
}
