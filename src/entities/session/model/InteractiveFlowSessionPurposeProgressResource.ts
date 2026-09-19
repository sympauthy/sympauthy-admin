import type { JSONSchemaType } from 'ajv'
import {
  type InteractiveFlowPurposeResource,
  interactiveFlowPurposeResourceSchema
} from '@/entities/session/model/InteractiveFlowPurposeResource'
import {
  type InteractiveFlowSessionDebugInformationResource,
  interactiveFlowSessionDebugInformationResourceSchema
} from '@/entities/session/model/InteractiveFlowSessionDebugInformationResource'
import { translateMessageOr } from '@/i18n'

export type InteractiveFlowSessionPurposeProgressResource = {
  purpose: InteractiveFlowPurposeResource
  /** One of `completed`, `current` or `pending`. */
  status: string
  debug: InteractiveFlowSessionDebugInformationResource[]
}

export const interactiveFlowSessionPurposeProgressResourceSchema: JSONSchemaType<InteractiveFlowSessionPurposeProgressResource> =
  {
    type: 'object',
    properties: {
      purpose: { ...interactiveFlowPurposeResourceSchema },
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
  return translateMessageOr(`common.interactiveFlowPurposeStatus.${status}`, status)
}
