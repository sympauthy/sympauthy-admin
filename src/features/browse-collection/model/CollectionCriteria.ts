import {
  saFilterIsMultiValued,
  saFilterIsValueless,
  type SaFilterCriterion,
  type SaSortKey
} from '@sympauthy/design'

/**
 * What a request asks of a collection beyond the page it wants: the filters that can be answered,
 * the order a person asked for, and the free text it is searched by. The package holds the first
 * two while they are on screen, and this is what they travel as.
 */
export interface CollectionCriteria {
  filters: SaFilterCriterion[]
  sort: SaSortKey[]
  query: string
}

/**
 * The value [criterion] is sent under.
 *
 * `is_null` asks whether the row carries a value at all and takes a boolean rather than one of the
 * field's own values, so it is always sent as `true`: the panel offers *is empty* and leaves
 * `is_null=false` — *carries any value* — to a caller writing the query string themselves.
 */
function collectionQueryValue(criterion: SaFilterCriterion): string {
  if (saFilterIsValueless(criterion.operator)) {
    return 'true'
  }
  return saFilterIsMultiValued(criterion.operator) ? criterion.values.join(',') : criterion.value
}

/**
 * [criteria] and the page asked for, as the query parameters the collection grammar spells them in.
 *
 * This is the one place that grammar is written: a bare `field=` is an exact match and every other
 * operator is a dotted suffix, `in` takes a comma-separated list, `sort` is an ordered list of keys
 * each descending under a leading `-`, and `q` is the free text.
 */
export function collectionQueryParams(
  criteria: CollectionCriteria,
  page: number,
  size: number
): Record<string, string | number | undefined> {
  const params: Record<string, string | number | undefined> = { page, size }

  for (const criterion of criteria.filters) {
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
export function collectionSortKeys(sort: string | null | undefined): SaSortKey[] {
  if (!sort) {
    return []
  }
  return sort
    .split(',')
    .map((key) => key.trim())
    .filter((key) => key !== '')
    .map((key) => ({ field: key.replace(/^-/, ''), descending: key.startsWith('-') }))
}
