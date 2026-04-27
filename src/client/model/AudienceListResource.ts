import type { JSONSchemaType } from 'ajv'
import { type AudienceResource, audienceResourceSchema } from '@/client/model/AudienceResource'

export type AudienceListResource = {
  audiences: AudienceResource[]
  page: number
  size: number
  total: number
}

export const audienceListResourceSchema: JSONSchemaType<AudienceListResource> = {
  type: 'object',
  properties: {
    audiences: {
      type: 'array',
      items: { ...audienceResourceSchema }
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
  required: ['audiences', 'page', 'size', 'total'],
  additionalProperties: true
}
