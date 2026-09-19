// Matches a trailing zone designator: `Z`, `+01:00` or `-0500`.
const ZONE_SUFFIX = /(Z|[+-]\d{2}:?\d{2})$/

/**
 * Formats a date and a time the API sent.
 *
 * The API sends its timestamps in UTC and without a zone designator, so one is added before
 * parsing: a bare `2026-09-05T09:14:22` would otherwise be read as a local time and displayed hours
 * away from when it happened.
 */
export function formatDateTime(dateStr: string): string {
  return new Date(ZONE_SUFFIX.test(dateStr) ? dateStr : `${dateStr}Z`).toLocaleString()
}
