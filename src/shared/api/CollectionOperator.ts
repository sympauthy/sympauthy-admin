/**
 * What a criterion asks of the field it names, written as a dotted suffix on that field's name.
 *
 * The set is closed and the server localizes none of it: a capability document publishes which
 * operators a field admits and leaves the words themselves to whatever renders a filter bar —
 * [browse-collection](../../features/browse-collection) holds the rules and the labels.
 */
export const collectionOperators = [
  'eq',
  'ne',
  'lt',
  'lte',
  'gt',
  'gte',
  'in',
  'contains',
  'starts_with',
  'is_null'
] as const

export type CollectionOperator = (typeof collectionOperators)[number]

/**
 * What kind of value a field holds, which is what decides the operators it admits and the control a
 * filter offers for it.
 */
export const collectionFieldTypes = [
  'string',
  'email',
  'phone_number',
  'timezone',
  'uuid',
  'enum',
  'boolean',
  'number',
  'date',
  'date_time'
] as const

export type CollectionFieldType = (typeof collectionFieldTypes)[number]
