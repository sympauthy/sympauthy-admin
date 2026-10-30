import type { JSONSchemaType } from 'ajv'

export type RevokedGrantsResource = {
  grants_revoked: number
}

export const revokedGrantsResourceSchema: JSONSchemaType<RevokedGrantsResource> = {
  type: 'object',
  properties: {
    grants_revoked: {
      type: 'number'
    }
  },
  required: ['grants_revoked'],
  additionalProperties: true
}
