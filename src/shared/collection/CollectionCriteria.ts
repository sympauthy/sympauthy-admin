import type { CollectionCapabilitiesResource } from './CollectionCapabilitiesResource'
import {
  isMultiValuedOperator,
  isValuelessOperator,
  type CollectionOperator
} from './CollectionOperator'

/**
 * One criterion narrowing a collection: a field it publishes, an operator that field admits, and
 * the value the two are asked of.
 *
 * [id] identifies the chip that holds it and never reaches the server. A field may carry more than
 * one criterion — `created_at.gte` beside `created_at.lte` is how a range is asked for — so the
 * field is not what addresses one.
 */
export interface CollectionCriterion {
  id: number
  field: string
  operator: CollectionOperator
  /** Under `in`, the values the caller picked; under `is_null`, ignored; otherwise one value. */
  value: string
  values: string[]
}

/**
 * One key a collection is ordered on, read from the largest value to the smallest under
 * [descending].
 */
export interface CollectionSortKey {
  field: string
  descending: boolean
}

/**
 * Everything a caller asks of a collection beyond the page they want: what narrows it, what orders
 * it, and the free text it is searched by.
 */
export interface CollectionCriteria {
  filters: CollectionCriterion[]
  sort: CollectionSortKey[]
  query: string
}

export function emptyCollectionCriteria(): CollectionCriteria {
  return { filters: [], sort: [], query: '' }
}

/**
 * Whether [criterion] is answerable as it stands, which is what keeps a chip a caller has opened
 * and not yet filled from narrowing the collection to nothing.
 */
export function isCriterionComplete(criterion: CollectionCriterion): boolean {
  if (isValuelessOperator(criterion.operator)) {
    return true
  }
  if (isMultiValuedOperator(criterion.operator)) {
    return criterion.values.length > 0
  }
  return criterion.value !== ''
}

/**
 * The value [criterion] is sent under.
 *
 * `is_null` asks whether the row carries a value at all and takes a boolean rather than one of the
 * field's own values, so it is always sent as `true`: the panel offers *is empty* and leaves
 * `is_null=false` — *carries any value* — to a caller writing the query string themselves.
 */
function collectionQueryValue(criterion: CollectionCriterion): string {
  if (isValuelessOperator(criterion.operator)) {
    return 'true'
  }
  return isMultiValuedOperator(criterion.operator) ? criterion.values.join(',') : criterion.value
}

/**
 * [criteria] and the page asked for, as the query parameters the collection grammar spells them in.
 *
 * This is the one place that grammar is written: a bare `field=` is an exact match and every other
 * operator is a dotted suffix, `in` takes a comma-separated list, `sort` is an ordered list of keys
 * each descending under a leading `-`, and `q` is the free text. An incomplete criterion is left
 * out rather than sent, since a value naming nothing is a `400` and the caller is still typing it.
 */
export function collectionQueryParams(
  criteria: CollectionCriteria,
  page: number,
  size: number
): Record<string, string | number | undefined> {
  const params: Record<string, string | number | undefined> = { page, size }

  for (const criterion of criteria.filters) {
    if (!isCriterionComplete(criterion)) {
      continue
    }
    const name =
      criterion.operator === 'eq' ? criterion.field : `${criterion.field}.${criterion.operator}`
    // Two criteria over one field and one operator cannot both be sent — the second would overwrite
    // the first in the query string — so the first one wins and the caller sees the other do
    // nothing rather than see it silently replace what they asked before it.
    if (params[name] !== undefined) {
      continue
    }
    params[name] = collectionQueryValue(criterion)
  }

  if (criteria.sort.length > 0) {
    params.sort = criteria.sort
      .map((key) => (key.descending ? `-${key.field}` : key.field))
      .join(',')
  }
  if (criteria.query !== '') {
    params.q = criteria.query
  }

  return params
}

/**
 * The keys [sort] names, read the way the `sort` parameter is written.
 *
 * It reads the `default_sort` a capability document publishes as well, which is spelled the same
 * way — that is what lets a header show which column a collection is already ordered on before the
 * caller has named a key.
 */
export function collectionSortKeys(sort: string | null | undefined): CollectionSortKey[] {
  if (!sort) {
    return []
  }
  return sort
    .split(',')
    .map((key) => key.trim())
    .filter((key) => key !== '')
    .map((key) => ({ field: key.replace(/^-/, ''), descending: key.startsWith('-') }))
}

/**
 * The order [criteria] reads in, which is what the caller asked for, or the collection's own where
 * they asked for nothing.
 */
export function effectiveSortKeys(
  criteria: CollectionCriteria,
  capabilities: CollectionCapabilitiesResource | null
): CollectionSortKey[] {
  if (criteria.sort.length > 0) {
    return criteria.sort
  }
  return collectionSortKeys(capabilities?.default_sort)
}
