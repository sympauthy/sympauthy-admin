import type { JSONSchemaType } from 'ajv'

export type UserMfaEnrollmentResource = {
  redirect_url: string
}

export const userMfaEnrollmentResourceSchema: JSONSchemaType<UserMfaEnrollmentResource> = {
  type: 'object',
  properties: {
    redirect_url: {
      type: 'string'
    }
  },
  required: ['redirect_url'],
  additionalProperties: true
}
