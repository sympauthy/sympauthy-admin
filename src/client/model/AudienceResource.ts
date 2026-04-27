import type { JSONSchemaType } from 'ajv'

export type AudienceResource = {
  audience_id: string
  token_audience: string
}

export const audienceResourceSchema: JSONSchemaType<AudienceResource> = {
  type: 'object',
  properties: {
    audience_id: {
      type: 'string'
    },
    token_audience: {
      type: 'string'
    }
  },
  required: ['audience_id', 'token_audience'],
  additionalProperties: true
}
