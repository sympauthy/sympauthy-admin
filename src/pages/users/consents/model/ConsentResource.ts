import type { JSONSchemaType } from 'ajv'
import { type ClientReferenceResource, clientReferenceResourceSchema } from '@/entities/client'

export type ConsentResource = {
  audience_id: string
  prompted_by_client: ClientReferenceResource
  scopes?: string[] | null
  consented_at: string
}

export const consentResourceSchema: JSONSchemaType<ConsentResource> = {
  type: 'object',
  properties: {
    audience_id: {
      type: 'string'
    },
    prompted_by_client: clientReferenceResourceSchema,
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
  required: ['audience_id', 'prompted_by_client', 'consented_at'],
  additionalProperties: true
}
