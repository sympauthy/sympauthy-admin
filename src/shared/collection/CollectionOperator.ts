/**
 * What a criterion asks of the field it names, written as a dotted suffix on that field's name.
 *
 * The set is closed and the server localizes none of it: a capability document publishes which
 * operators a field admits and leaves the words themselves to whatever renders a filter bar, which
 * is why the panel holds both the list and the labels.
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
 * chip offers for it.
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

/**
 * The operator a field of this type opens on, which is the one its values are most often asked by:
 * a person typing part of a name means `contains`, and a date is nearly always a lower bound.
 *
 * A field narrowing the set its type admits may not admit its own default, so
 * [defaultCollectionOperator] falls back to what the field does list.
 */
const defaultOperators: Record<CollectionFieldType, CollectionOperator> = {
  string: 'contains',
  email: 'contains',
  phone_number: 'contains',
  timezone: 'eq',
  uuid: 'eq',
  enum: 'eq',
  boolean: 'eq',
  number: 'gte',
  date: 'gte',
  date_time: 'gte'
}

/**
 * The operator a chip over a field of [type] opens on, taken from [admitted] when the type's own
 * default is not one of them.
 */
export function defaultCollectionOperator(
  type: CollectionFieldType,
  admitted: CollectionOperator[]
): CollectionOperator {
  const preferred = defaultOperators[type]
  return admitted.includes(preferred) ? preferred : (admitted[0] ?? 'eq')
}

/**
 * The message key an operator is labelled from, for a field of [type].
 *
 * The four comparisons read differently over a moment than over a quantity — *is on or after*
 * rather than *is at least* — so a date's keys are their own; every other type reads the generic
 * wording, and [translateMessageOr] is not involved because the panel owns all of these strings.
 */
export function collectionOperatorLabelKey(
  operator: CollectionOperator,
  type: CollectionFieldType
): string {
  const dated = type === 'date' || type === 'date_time'
  return dated ? `common.operators.date.${operator}` : `common.operators.${operator}`
}

/**
 * Whether an operator takes no value at all, which is `is_null` and nothing else: the row either
 * carries a value for the field or it does not, and the parameter says which.
 */
export function isValuelessOperator(operator: CollectionOperator): boolean {
  return operator === 'is_null'
}

/**
 * Whether an operator takes several values, which is `in` and nothing else. They travel as one
 * comma-separated parameter, which is why no field whose values may hold a comma admits it.
 */
export function isMultiValuedOperator(operator: CollectionOperator): boolean {
  return operator === 'in'
}
