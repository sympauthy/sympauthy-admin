import type { JSONSchemaType } from 'ajv'
import { translateMessageOr } from '@/shared/i18n'

export type UserMfaMethodResource = {
  mfa_id: string
  type: string
  registered_at: string
}

export const userMfaMethodResourceSchema: JSONSchemaType<UserMfaMethodResource> = {
  type: 'object',
  properties: {
    mfa_id: {
      type: 'string'
    },
    type: {
      type: 'string'
    },
    registered_at: {
      type: 'string'
    }
  },
  required: ['mfa_id', 'type', 'registered_at'],
  additionalProperties: true
}

export function userMfaMethodTypeLabel(type: string): string {
  return translateMessageOr(`terms.user.mfaType.values.${type}`, type)
}
