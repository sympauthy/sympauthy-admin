import { shallowRef } from 'vue'
import { requestedLocale } from '@/shared/i18n'

// Matches a trailing zone designator: `Z`, `+01:00` or `-0500`.
const ZONE_SUFFIX = /(Z|[+-]\d{2}:?\d{2})$/

/**
 * Reads a date and time the API sent.
 *
 * The API sends its timestamps in UTC and without a zone designator, so one is added before
 * parsing: a bare `2026-09-05T09:14:22` would otherwise be read as a local time and displayed hours
 * away from when it happened.
 */
function parseApiDate(dateStr: string): Date {
  return new Date(ZONE_SUFFIX.test(dateStr) ? dateStr : `${dateStr}Z`)
}

/** How a date is written: in ISO 8601 on a 24-hour clock, or in the format of the panel's language. */
export type DateFormat = 'iso' | 'language'

export interface DateDisplay {
  format: DateFormat
  /** A zone the platform knows, `UTC` among them, or `undefined` for the browser's. */
  timeZone?: string
}

// Read during a render, so a screen drawing a date is drawn again when the operator changes how.
const display = shallowRef<DateDisplay>({ format: 'iso' })

/** Writes every date from the next render on as [next] says. */
export function setDateDisplay(next: DateDisplay): void {
  display.value = next
}

/** The zone the device is in, read at each call since it follows the device as it travels. */
export function browserTimeZone(): string {
  return new Intl.DateTimeFormat().resolvedOptions().timeZone
}

/** Every zone the platform names, which is what a zone can be chosen among. */
export function timeZones(): string[] {
  return Intl.supportedValuesOf('timeZone')
}

/** Whether the platform can write a date in [zone]. */
export function isTimeZone(zone: string): boolean {
  try {
    new Intl.DateTimeFormat('en', { timeZone: zone })
    return true
  } catch {
    return false
  }
}

type Parts = 'date' | 'dateTime' | 'time'

const ISO_PARTS: Record<Parts, Intl.DateTimeFormatOptions> = {
  date: { year: 'numeric', month: '2-digit', day: '2-digit' },
  dateTime: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  },
  time: { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }
}

// What `toLocaleDateString`, `toLocaleString` and `toLocaleTimeString` write when given no options,
// which is how the panel wrote every date before a format could be chosen.
const LANGUAGE_PARTS: Record<Parts, Intl.DateTimeFormatOptions> = {
  date: { year: 'numeric', month: 'numeric', day: 'numeric' },
  dateTime: {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  },
  time: { hour: 'numeric', minute: 'numeric', second: 'numeric' }
}

// A formatter is costly to build and a table draws a date per row, so each is built once.
const formatters = new Map<string, Intl.DateTimeFormat>()

function formatter(locale: string, parts: Parts, format: DateFormat, timeZone?: string) {
  const key = [locale, parts, format, timeZone].join('|')
  let built = formatters.get(key)
  if (built === undefined) {
    const options = format === 'iso' ? ISO_PARTS[parts] : LANGUAGE_PARTS[parts]
    built = new Intl.DateTimeFormat(locale, { ...options, timeZone })
    formatters.set(key, built)
  }
  return built
}

/**
 * Writes the parts as ISO 8601 does, `2026-11-11 14:03`. The parts are read from a formatter rather
 * than from the `Date`, since only a formatter knows the date in a zone other than the browser's.
 */
function formatIso(date: Date, parts: Parts, timeZone?: string): string {
  const values: Partial<Record<Intl.DateTimeFormatPartTypes, string>> = {}
  for (const part of formatter('en-US', parts, 'iso', timeZone).formatToParts(date)) {
    values[part.type] = part.value
  }
  const day = `${values.year}-${values.month}-${values.day}`
  const time = `${values.hour}:${values.minute}`
  return parts === 'date' ? day : parts === 'time' ? time : `${day} ${time}`
}

function formatParts(dateStr: string, parts: Parts): string {
  const { format, timeZone } = display.value
  const date = parseApiDate(dateStr)
  const text =
    format === 'iso'
      ? formatIso(date, parts, timeZone)
      : formatter(requestedLocale(), parts, format, timeZone).format(date)
  // A time read in another zone than the device's would be taken for a local one, so it names the
  // zone it is in. A day alone names none: it is the line a time is read under, not a time.
  return parts !== 'date' && timeZone !== undefined && timeZone !== browserTimeZone()
    ? `${text} ${timeZone}`
    : text
}

/** Formats a date the API sent, in the operator's date format and zone. */
export function formatDate(dateStr: string): string {
  return formatParts(dateStr, 'date')
}

/**
 * Formats a date and a time the API sent, in the operator's date format and zone. Use it where the
 * day alone says nothing — a list of what is happening right now, rather than of what a record holds.
 */
export function formatDateTime(dateStr: string): string {
  return formatParts(dateStr, 'dateTime')
}

/** Formats the time of day of a date the API sent, in the operator's date format and zone. */
export function formatTime(dateStr: string): string {
  return formatParts(dateStr, 'time')
}

/** Orders two dates the API sent, the earlier first, whatever zone designator each carries. */
export function compareApiDates(a: string, b: string): number {
  return parseApiDate(a).getTime() - parseApiDate(b).getTime()
}

/**
 * A date the API sent, as the ISO string a `<time datetime>` reads. The API's own string carries no
 * zone designator, which that attribute would read as a local time.
 */
export function isoDateTime(dateStr: string): string {
  return parseApiDate(dateStr).toISOString()
}
