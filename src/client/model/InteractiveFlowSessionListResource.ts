import type { JSONSchemaType } from 'ajv'
import {
  type InteractiveFlowSessionSummaryResource,
  interactiveFlowSessionSummaryResourceSchema
} from '@/client/model/InteractiveFlowSessionSummaryResource'

export type InteractiveFlowSessionListResource = {
  sessions: InteractiveFlowSessionSummaryResource[]
  page: number
  size: number
  total: number
}

export const interactiveFlowSessionListResourceSchema: JSONSchemaType<InteractiveFlowSessionListResource> =
  {
    type: 'object',
    properties: {
      sessions: {
        type: 'array',
        items: { ...interactiveFlowSessionSummaryResourceSchema }
      },
      page: {
        type: 'number'
      },
      size: {
        type: 'number'
      },
      total: {
        type: 'number'
      }
    },
    required: ['sessions', 'page', 'size', 'total'],
    additionalProperties: true
  }
