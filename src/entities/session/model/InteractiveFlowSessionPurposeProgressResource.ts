import type { JSONSchemaType } from 'ajv'
import {
  type InteractiveFlowSessionDebugInformationResource,
  interactiveFlowSessionDebugInformationResourceSchema
} from '@/entities/session/model/InteractiveFlowSessionDebugInformationResource'
import { translateMessageOr } from '@/shared/i18n'

export type InteractiveFlowSessionPurposeProgressResource = {
  purpose: string
  status: string
  debug: InteractiveFlowSessionDebugInformationResource[]
}

export const interactiveFlowSessionPurposeProgressResourceSchema: JSONSchemaType<InteractiveFlowSessionPurposeProgressResource> =
  {
    type: 'object',
    properties: {
      purpose: {
        type: 'string'
      },
      status: {
        type: 'string'
      },
      debug: {
        type: 'array',
        items: { ...interactiveFlowSessionDebugInformationResourceSchema }
      }
    },
    required: ['purpose', 'status', 'debug'],
    additionalProperties: true
  }

/**
 * The entry of a purpose holding `code`, or undefined where the purpose answers none — a code a
 * server added after this panel, or one it removed, is read as no entry at all.
 */
export function purposeDebugInformation(
  progress: InteractiveFlowSessionPurposeProgressResource,
  code: string
): InteractiveFlowSessionDebugInformationResource | undefined {
  return progress.debug.find((information) => information.code === code)
}

export function purposeProgressColor(status: string): 'green' | 'blue' | 'gray' {
  switch (status) {
    case 'completed':
      return 'green'
    case 'current':
      return 'blue'
    default:
      return 'gray'
  }
}

export function purposeProgressLabel(status: string): string {
  return translateMessageOr(`terms.interactiveFlowPurpose.status.values.${status}`, status)
}
