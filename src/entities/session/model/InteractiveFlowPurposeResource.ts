import type { JSONSchemaType } from 'ajv'
import { translateMessageOr } from '@/i18n'

export type InteractiveFlowPurposeResource = {
  value: string
  display_name: string
}

export const interactiveFlowPurposeResourceSchema: JSONSchemaType<InteractiveFlowPurposeResource> =
  {
    type: 'object',
    properties: {
      value: {
        type: 'string'
      },
      display_name: {
        type: 'string'
      }
    },
    required: ['value', 'display_name'],
    additionalProperties: true
  }

/**
 * Every purpose the server publishes today. Only the filter dropdown needs it: everywhere else a
 * purpose arrives on a session, carrying its own label.
 */
export const interactiveFlowPurposes = [
  'confirm',
  'oauth2_authorize',
  'mfa_enrollment',
  'mfa_challenge',
  'reauthentication',
  'link_provider'
]

/**
 * Label a purpose is read under. Branching happens on the wire value and never on the label the
 * server sent: the server states a label may be reworded in any release.
 *
 * The translation wins where this admin panel knows the value, and the server's label is what a
 * person reads otherwise — so a purpose added on the server before the panel knows about it still
 * renders a sentence rather than an enum name.
 */
export function purposeLabel(purpose: InteractiveFlowPurposeResource): string {
  return purposeValueLabel(purpose.value, purpose.display_name)
}

/**
 * Label of a purpose named by its wire value alone, for the filter dropdown — which has no session
 * row to read a label off. Falls back to the value itself.
 */
export function purposeValueLabel(value: string, fallback: string = value): string {
  return translateMessageOr(`common.interactiveFlowPurpose.${value}`, fallback)
}
