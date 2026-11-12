import { availableLanguages } from '@/shared/i18n'
import { type DateFormat, isTimeZone } from '@/shared/lib'

/** The claim the server's `admin` environment declares to keep an operator's preferences in. */
export const PREFERENCES_CLAIM = 'sympauthy_admin_preferences'

/** `system` follows the device. */
export type Theme = 'light' | 'dark' | 'system'

const THEMES: readonly Theme[] = ['light', 'dark', 'system']
const DATE_FORMATS: readonly DateFormat[] = ['iso', 'language']

export interface Preferences {
  theme: Theme
  /** A language a bundle exists for, or `undefined` for the browser's. */
  language?: string
  dateFormat: DateFormat
  /** A zone the platform knows, `UTC` among them, or `undefined` for the browser's. */
  timeZone?: string
}

export const DEFAULT_PREFERENCES: Preferences = { theme: 'system', dateFormat: 'iso' }

/**
 * Preferences as they were saved, and when. The server answers a claim's value and not when it was
 * written, so the time travels in the document, and decides whether the account's copy or the
 * browser's is applied.
 */
export interface SavedPreferences {
  preferences: Preferences
  /** Absent from a document nothing dated, which is older than any copy the browser keeps. */
  updatedAt?: string
}

/** The document the claim holds, as this panel writes it. A member left out is its default. */
export type PreferencesDocument = {
  theme: Theme
  language?: string
  date_format: DateFormat
  time_zone?: string
  updated_at?: string
}

function oneOf<T extends string>(value: unknown, values: readonly T[]): T | undefined {
  return values.find((candidate) => candidate === value)
}

/**
 * Reads a document from the account or from the browser, or `undefined` where [value] is no
 * document at all.
 *
 * A member or a value the panel cannot use is that preference's default, with no error: a member a
 * later panel added, a theme it does not draw, a language whose bundle is gone.
 */
export function readPreferencesDocument(value: unknown): SavedPreferences | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return undefined
  }
  const document = value as Record<string, unknown>
  const { language, time_zone: timeZone, updated_at: updatedAt } = document
  return {
    preferences: {
      theme: oneOf(document.theme, THEMES) ?? DEFAULT_PREFERENCES.theme,
      language: oneOf(language, availableLanguages()),
      dateFormat: oneOf(document.date_format, DATE_FORMATS) ?? DEFAULT_PREFERENCES.dateFormat,
      timeZone: typeof timeZone === 'string' && isTimeZone(timeZone) ? timeZone : undefined
    },
    updatedAt:
      typeof updatedAt === 'string' && !Number.isNaN(Date.parse(updatedAt)) ? updatedAt : undefined
  }
}

export function toPreferencesDocument(
  preferences: Preferences,
  updatedAt: string | undefined
): PreferencesDocument {
  return {
    theme: preferences.theme,
    ...(preferences.language !== undefined ? { language: preferences.language } : {}),
    date_format: preferences.dateFormat,
    ...(preferences.timeZone !== undefined ? { time_zone: preferences.timeZone } : {}),
    ...(updatedAt !== undefined ? { updated_at: updatedAt } : {})
  }
}

function savedAt(saved: SavedPreferences | undefined): number {
  return saved?.updatedAt !== undefined ? Date.parse(saved.updatedAt) : -Infinity
}

/** Whether [saved] was saved after [other], which a copy that does not exist always was. */
export function isSavedAfter(
  saved: SavedPreferences,
  other: SavedPreferences | undefined
): boolean {
  return other === undefined || savedAt(saved) > savedAt(other)
}
