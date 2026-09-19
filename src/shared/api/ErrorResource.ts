import type { JSONSchemaType } from 'ajv'

export type ErrorResource = {
  error_code: string
  details?: string
  description?: string
  properties?: Array<PropertyErrorResource>
}

export type PropertyErrorResource = {
  path: string
  description?: string
}

export const propertyErrorResourceSchema: JSONSchemaType<PropertyErrorResource> = {
  type: 'object',
  properties: {
    path: {
      type: ['string']
    },
    description: {
      type: ['string'],
      nullable: true
    }
  },
  required: ['path'],
  additionalProperties: true
}

export const errorResourceSchema: JSONSchemaType<ErrorResource> = {
  type: 'object',
  properties: {
    error_code: {
      type: ['string']
    },
    details: {
      type: ['string'],
      nullable: true
    },
    description: {
      type: ['string'],
      nullable: true
    },
    properties: {
      type: 'array',
      items: {
        ...propertyErrorResourceSchema
      },
      nullable: true
    }
  },
  required: ['error_code'],
  additionalProperties: true
}
