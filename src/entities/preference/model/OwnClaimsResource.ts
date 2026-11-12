import type { JSONSchemaType } from 'ajv'

export type OwnClaimsResource = {
  claims: Record<string, unknown>
}

export const ownClaimsResourceSchema: JSONSchemaType<OwnClaimsResource> = {
  type: 'object',
  properties: {
    claims: {
      type: 'object',
      required: [],
      additionalProperties: true
    }
  },
  required: ['claims'],
  additionalProperties: true
}
