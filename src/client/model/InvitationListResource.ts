import type { JSONSchemaType } from 'ajv'
import {
  type InvitationResource,
  invitationResourceSchema
} from '@/client/model/InvitationResource'

export type InvitationListResource = {
  invitations: InvitationResource[]
  page: number
  size: number
  total: number
}

export const invitationListResourceSchema: JSONSchemaType<InvitationListResource> = {
  type: 'object',
  properties: {
    invitations: {
      type: 'array',
      items: { ...invitationResourceSchema }
    },
    page: {
      type: 'number'
    },
    size: {
      type: 'number'
    },
    total: {
      type: 'number'
    }
  },
  required: ['invitations', 'page', 'size', 'total'],
  additionalProperties: true
}
