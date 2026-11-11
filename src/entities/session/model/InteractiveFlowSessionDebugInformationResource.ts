import type { JSONSchemaType } from 'ajv'
import { translateMessageOr } from '@/shared/i18n'

/**
 * One value a session holds for a purpose, for an operator to read.
 *
 * `code` is a key the server never renames, so a screen may switch on it to label and draw the value.
 * `type` says how `value` is written — `text` a string, `text_list` an array of strings, `date` a
 * date and time in UTC, `presence` whether the session holds a value the server does not publish —
 * which is what lets a code the panel holds no label for yet still be drawn as what it is.
 */
export type InteractiveFlowSessionDebugInformationResource = {
  code: string
  type: string
  value?: string | string[] | boolean | null
}

/**
 * The value of an entry, as a schema: the four shapes `type` names, and the absent value an entry
 * that holds nothing is listed with all the same.
 *
 * AJV's `JSONSchemaType` cannot type a union that includes null, so this one is written plainly and
 * declared past it. The looseness is the schema's type and not the schema: what it validates is
 * every case the field holds and nothing else.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const debugValueSchema: any = {
  oneOf: [
    { type: 'string' },
    { type: 'array', items: { type: 'string' } },
    { type: 'boolean' },
    { type: 'null' }
  ]
}

export const interactiveFlowSessionDebugInformationResourceSchema: JSONSchemaType<InteractiveFlowSessionDebugInformationResource> =
  {
    type: 'object',
    properties: {
      code: {
        type: 'string'
      },
      type: {
        type: 'string'
      },
      value: debugValueSchema
    },
    required: ['code', 'type'],
    additionalProperties: true
  }

/**
 * Label an entry is read under. A code the panel does not know yet is read under the code itself,
 * which names the field it came from closely enough to grep the server for.
 */
export function debugInformationLabel(code: string): string {
  return translateMessageOr(`terms.interactiveFlowPurpose.debug.${code}.label`, code)
}

/** What an entry is there for, where the panel has a sentence saying so. */
export function debugInformationHelp(code: string): string | undefined {
  return translateMessageOr(`terms.interactiveFlowPurpose.debug.${code}.help`, '') || undefined
}

/**
 * Label a `text` entry's value is read under, for a code whose values are a closed set of the
 * server's. Any other value, and one of those the panel does not know yet, is read as it arrived.
 */
export function debugInformationValueLabel(code: string, value: string): string {
  return translateMessageOr(`terms.interactiveFlowPurpose.debug.${code}.values.${value}`, value)
}
