import type { JSONSchemaType } from 'ajv'
import {
  type InteractiveFlowSessionSecurityContextResource,
  interactiveFlowSessionSecurityContextResourceSchema
} from '@/client/model/InteractiveFlowSessionSecurityContextResource'

export type InteractiveFlowSessionSecurityContextListResource = {
  /** The place seen most recently first. */
  security_contexts: InteractiveFlowSessionSecurityContextResource[]
  page: number
  size: number
  total: number
}

export const interactiveFlowSessionSecurityContextListResourceSchema: JSONSchemaType<InteractiveFlowSessionSecurityContextListResource> =
  {
    type: 'object',
    properties: {
      security_contexts: {
        type: 'array',
        items: { ...interactiveFlowSessionSecurityContextResourceSchema }
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
    required: ['security_contexts', 'page', 'size', 'total'],
    additionalProperties: true
  }
