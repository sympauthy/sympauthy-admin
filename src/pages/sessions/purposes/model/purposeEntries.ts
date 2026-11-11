import {
  debugInformationHelp,
  debugInformationLabel,
  debugInformationValueLabel,
  type InteractiveFlowSessionDebugInformationResource,
  type InteractiveFlowSessionPurposeProgressResource,
  purposeDebugInformation
} from '@/entities/session'
import { grantConsentedByLabel, grantGrantedByLabel } from '@/entities/grant'
import { formatDateTime, formatTime, isoDateTime } from '@/shared/lib'

interface ScopeList {
  /** The kind its scopes are drawn as; undefined draws the neutral tag. */
  type?: string
  /** The codes of the entries saying how and when its scopes were given. */
  by?: string
  at?: string
  byLabel?: (value: string) => string
}

/**
 * A scope list whose scopes are given in one way, drawn as the scopes screen draws that kind, and
 * the two entries saying how and when they were given — read as its caption rather than as rows of
 * their own. The requested scopes were given nothing yet, so they keep the neutral tag and are
 * captioned by their count.
 */
const SCOPE_LISTS: Record<string, ScopeList> = {
  requested_scopes: {},
  consented_scopes: {
    type: 'consentable',
    by: 'consented_by',
    at: 'consented_at',
    byLabel: grantConsentedByLabel
  },
  granted_scopes: {
    type: 'grantable',
    by: 'granted_by',
    at: 'granted_at',
    byLabel: grantGrantedByLabel
  }
}

/** An entry another one reads beside its own value: the method a code challenge was made with. */
const DETAILS: Record<string, string> = {
  code_challenge: 'code_challenge_method'
}

// Every entry read as another's caption or detail.
const FOLDED_CODES = new Set([
  ...Object.values(SCOPE_LISTS).flatMap(({ by, at }) => [by, at]),
  ...Object.values(DETAILS)
])

/**
 * The codes whose value is read character by character. A code the panel does not know takes the
 * body face, since nothing tells an identifier from a word.
 */
const MONO_CODES = new Set([
  'client_id',
  'redirect_uri',
  'invitation_id',
  'target_provider_id',
  'authorizing_provider_id'
])

/** How a row's value is drawn. */
export type PurposeRowValue =
  | { kind: 'empty' }
  | { kind: 'scopes'; scopes: string[]; scopeType?: string }
  | { kind: 'tags'; tags: string[] }
  | { kind: 'date'; datetime: string; text: string }
  | { kind: 'text'; text: string; mono: boolean }

export interface PurposeRow {
  code: string
  label: string
  /** Under the label: how many scopes were asked for, or how and when they were given. */
  caption?: string
  value: PurposeRowValue
}

export interface PurposeCheck {
  code: string
  label: string
  /** Whether the session holds the value; `unknown` where the purpose has no record to ask. */
  state: 'present' | 'absent' | 'unknown'
  /** The entry read beside the presence, as the method of a code challenge. */
  detail?: string
  help?: string
}

export interface PurposeEntries {
  rows: PurposeRow[]
  checks: PurposeCheck[]
  /** Whether a row lists scopes, which is what the card's legend is drawn for. */
  listsScopes: boolean
}

/**
 * The entries of one purpose as its card draws them: a row for each value, and a check for each
 * value the session holds but the server does not publish.
 *
 * The order is the server's. An entry another one reads as its caption or its detail is not drawn
 * twice, and neither is a client the session's summary already names.
 */
export function purposeEntries(
  progress: InteractiveFlowSessionPurposeProgressResource,
  sessionClientId: string | null | undefined,
  scopeCount: (count: number) => string
): PurposeEntries {
  const rows: PurposeRow[] = []
  const checks: PurposeCheck[] = []

  for (const information of progress.debug) {
    const { code } = information
    if (FOLDED_CODES.has(code) || (code === 'client_id' && information.value === sessionClientId)) {
      continue
    }

    if (information.type === 'presence') {
      const detail = DETAILS[code] ? purposeDebugInformation(progress, DETAILS[code]) : undefined
      checks.push({
        code,
        label: debugInformationLabel(code),
        state: presenceState(information.value),
        detail: typeof detail?.value === 'string' ? detail.value : undefined,
        help: debugInformationHelp(code)
      })
      continue
    }

    const scopeList = SCOPE_LISTS[code]
    rows.push({
      code,
      label: debugInformationLabel(code),
      caption: scopeList
        ? scopeListCaption(progress, information, scopeList, scopeCount)
        : undefined,
      value: rowValue(information, scopeList)
    })
  }

  return {
    rows,
    checks,
    listsScopes: rows.some(({ code }) => SCOPE_LISTS[code] !== undefined)
  }
}

function presenceState(value: InteractiveFlowSessionDebugInformationResource['value']) {
  if (typeof value !== 'boolean') {
    return 'unknown'
  }
  return value ? 'present' : 'absent'
}

function rowValue(
  { code, type, value }: InteractiveFlowSessionDebugInformationResource,
  scopeList: ScopeList | undefined
): PurposeRowValue {
  if (value == null || (Array.isArray(value) && value.length === 0)) {
    return { kind: 'empty' }
  }
  if (Array.isArray(value)) {
    return scopeList
      ? { kind: 'scopes', scopes: value, scopeType: scopeList.type }
      : { kind: 'tags', tags: value.map((item) => debugInformationValueLabel(code, item)) }
  }
  if (type === 'date' && typeof value === 'string') {
    return { kind: 'date', datetime: isoDateTime(value), text: formatDateTime(value) }
  }
  if (typeof value === 'string') {
    return {
      kind: 'text',
      text: debugInformationValueLabel(code, value),
      mono: MONO_CODES.has(code)
    }
  }
  // A type this panel does not know yet, read as the server wrote it.
  return { kind: 'text', text: String(value), mono: false }
}

function scopeListCaption(
  progress: InteractiveFlowSessionPurposeProgressResource,
  information: InteractiveFlowSessionDebugInformationResource,
  { by, at, byLabel }: ScopeList,
  scopeCount: (count: number) => string
): string | undefined {
  if (!by && !at) {
    return Array.isArray(information.value) ? scopeCount(information.value.length) : undefined
  }
  const byValue = by ? purposeDebugInformation(progress, by)?.value : undefined
  const atValue = at ? purposeDebugInformation(progress, at)?.value : undefined
  const parts = [
    typeof byValue === 'string' && byLabel ? byLabel(byValue) : undefined,
    typeof atValue === 'string' ? formatTime(atValue) : undefined
  ].filter((part): part is string => part !== undefined)
  return parts.length > 0 ? parts.join(' · ') : undefined
}
