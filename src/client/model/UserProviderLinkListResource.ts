import type { JSONSchemaType } from 'ajv'
import {
  type UserProviderLinkResource,
  userProviderLinkResourceSchema,
} from '@/client/model/UserProviderLinkResource'

export type UserProviderLinkListResource = {
  providers: UserProviderLinkResource[]
  page: number
  size: number
  total: number
}

export const userProviderLinkListResourceSchema: JSONSchemaType<UserProviderLinkListResource> = {
  type: 'object',
  properties: {
    providers: {
      type: 'array',
      items: { ...userProviderLinkResourceSchema },
    },
    page: {
      type: 'number',
    },
    size: {
      type: 'number',
    },
    total: {
      type: 'number',
    },
  },
  required: ['providers', 'page', 'size', 'total'],
  additionalProperties: true,
}
