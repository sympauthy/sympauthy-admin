import type { JSONSchemaType } from 'ajv'

export type UserProviderLinkStartResource = {
  redirect_url: string
}

export const userProviderLinkStartResourceSchema: JSONSchemaType<UserProviderLinkStartResource> = {
  type: 'object',
  properties: {
    redirect_url: {
      type: 'string'
    }
  },
  required: ['redirect_url'],
  additionalProperties: true
}
