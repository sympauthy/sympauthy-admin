import { translateMessageOr } from '@/shared/i18n'

/**
 * Label a purpose is read under. The API publishes a purpose by its wire value alone, so the name a
 * person reads is this panel's to write.
 *
 * A purpose added on the server before the panel knows about it still renders, under its wire value.
 */
export function purposeLabel(purpose: string): string {
  return translateMessageOr(`terms.interactiveFlowPurpose.values.${purpose}`, purpose)
}

/**
 * The sentence saying what a purpose is there to settle, under its name on the session's record.
 * A purpose the panel does not know yet has none.
 */
export function purposeDescription(purpose: string): string | undefined {
  return translateMessageOr(`terms.interactiveFlowPurpose.valuesHelp.${purpose}`, '') || undefined
}
