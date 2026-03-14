import type { JSONSchemaType } from 'ajv'

export type ConsentResource = {
  client_id: string
  scopes?: string[] | null
  consented_at: string
}

export const consentResourceSchema: JSONSchemaType<ConsentResource> = {
  type: 'object',
  properties: {
    client_id: {
      type: 'string',
    },
    scopes: {
      type: 'array',
      items: {
        type: 'string',
      },
      nullable: true,
    },
    consented_at: {
      type: 'string',
    },
  },
  required: ['client_id', 'consented_at'],
  additionalProperties: true,
}
