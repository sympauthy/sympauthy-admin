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

/** Formats a date the API sent, in the reader's own zone. */
export function formatDate(dateStr: string): string {
  return parseApiDate(dateStr).toLocaleDateString()
}

/**
 * Formats a date and a time the API sent, in the reader's own zone. Use it where the day alone says
 * nothing — a list of what is happening right now, rather than of what a record holds.
 */
export function formatDateTime(dateStr: string): string {
  return parseApiDate(dateStr).toLocaleString()
}
