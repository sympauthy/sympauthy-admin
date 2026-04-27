import type { JSONSchemaType } from 'ajv'

export type UserProviderLinkResource = {
  provider_id: string
  subject: string
  linked_at: string
}

export const userProviderLinkResourceSchema: JSONSchemaType<UserProviderLinkResource> = {
  type: 'object',
  properties: {
    provider_id: {
      type: 'string'
    },
    subject: {
      type: 'string'
    },
    linked_at: {
      type: 'string'
    }
  },
  required: ['provider_id', 'subject', 'linked_at'],
  additionalProperties: true
}
