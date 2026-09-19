import type { JSONSchemaType } from 'ajv'

export type AudienceResource = {
  audience_id: string
  token_audience: string
  sign_up_enabled: boolean
  invitation_enabled: boolean
  clients_count: number
}

export const audienceResourceSchema: JSONSchemaType<AudienceResource> = {
  type: 'object',
  properties: {
    audience_id: {
      type: 'string'
    },
    token_audience: {
      type: 'string'
    },
    sign_up_enabled: {
      type: 'boolean'
    },
    invitation_enabled: {
      type: 'boolean'
    },
    clients_count: {
      type: 'number'
    }
  },
  required: [
    'audience_id',
    'token_audience',
    'sign_up_enabled',
    'invitation_enabled',
    'clients_count'
  ],
  additionalProperties: true
}

export function audienceRegistrationModeKey(audience: AudienceResource): string {
  if (audience.sign_up_enabled && audience.invitation_enabled)
    return 'common.audience.registrationMode.openInvitations'
  if (audience.sign_up_enabled) return 'common.audience.registrationMode.open'
  if (audience.invitation_enabled) return 'common.audience.registrationMode.invitationOnly'
  return 'common.audience.registrationMode.closed'
}

export function audienceRegistrationModeColor(
  audience: AudienceResource
): 'green' | 'yellow' | 'red' {
  if (audience.sign_up_enabled) return 'green'
  if (audience.invitation_enabled) return 'yellow'
  return 'red'
}
