import type { JSONSchemaType } from 'ajv'

/**
 * One thing a purpose has to say about where a session stands.
 *
 * `display_name` is a label the handler wrote for a person to read, not a key: it is rendered as it
 * arrives, is never translated, and nothing may branch on it.
 */
export type InteractiveFlowSessionDebugInformationResource = {
  display_name: string
  /** Absent where the field exists and holds nothing. The entry itself is never omitted. */
  value?: string | null
}

export const interactiveFlowSessionDebugInformationResourceSchema: JSONSchemaType<InteractiveFlowSessionDebugInformationResource> =
  {
    type: 'object',
    properties: {
      display_name: {
        type: 'string'
      },
      value: {
        type: 'string',
        nullable: true
      }
    },
    required: ['display_name'],
    additionalProperties: true
  }
