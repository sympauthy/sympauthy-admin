import type { JSONSchemaType } from 'ajv'

export type ConsentResource = {
  audience_id: string
  prompted_by_client_id: string
  scopes?: string[] | null
  consented_at: string
}

export const consentResourceSchema: JSONSchemaType<ConsentResource> = {
  type: 'object',
  properties: {
    audience_id: {
      type: 'string'
    },
    prompted_by_client_id: {
      type: 'string'
    },
    scopes: {
      type: 'array',
      items: {
        type: 'string'
      },
      nullable: true
    },
    consented_at: {
      type: 'string'
    }
  },
  required: ['audience_id', 'prompted_by_client_id', 'consented_at'],
  additionalProperties: true
}
