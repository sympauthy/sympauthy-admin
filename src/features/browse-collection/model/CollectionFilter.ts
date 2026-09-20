import {
  collectionFieldTypes,
  collectionOperators,
  type CollectionCapabilitiesResource,
  type CollectionFieldType,
  type CollectionFilterValueResource,
  type CollectionOperator
} from '@/shared/api'

/**
 * One field a collection filters on, once the panel has checked it can render it: the type and the
 * operators are words it knows, where [CollectionFilterResource] carries whatever the server sent.
 */
export interface CollectionFilter {
  field: string
  name: string
  type: CollectionFieldType
  operators: CollectionOperator[]
  values?: CollectionFilterValueResource[] | null
}

/**
 * The filters of [capabilities] the panel can render, which are the ones whose type it knows and
 * which admit at least one operator it knows.
 *
 * A deployment running a server newer than its panel publishes a field the panel has no control
 * for. Dropping that field leaves every other one usable, where trusting it would put a filter on
 * screen that cannot be filled, and refusing the whole document would blank the toolbar.
 */
export function knownCollectionFilters(
  capabilities: CollectionCapabilitiesResource | null
): CollectionFilter[] {
  if (!capabilities) {
    return []
  }
  const filters: CollectionFilter[] = []
  for (const filter of capabilities.filters) {
    const type = collectionFieldTypes.find((known) => known === filter.type)
    if (!type) {
      continue
    }
    const operators = collectionOperators.filter((known) => filter.operators.includes(known))
    if (operators.length === 0) {
      continue
    }
    filters.push({ ...filter, type, operators })
  }
  return filters
}

/**
 * The set a criterion over [filter] picks its value from, or `null` where the field takes any value
 * it is given.
 *
 * A field publishing `values` is answered from those whatever its type: the set is this
 * deployment's, and a value it does not hold is a `400`. A boolean has a set of two without
 * publishing one, since [yes] and [no] are words the panel owns rather than values the server
 * names — which is why they are passed in and not read here.
 */
export function collectionFilterValues(
  filter: CollectionFilter,
  yes: string,
  no: string
): CollectionFilterValueResource[] | null {
  if (filter.values && filter.values.length > 0) {
    return filter.values
  }
  if (filter.type === 'boolean') {
    return [
      { value: 'true', name: yes },
      { value: 'false', name: no }
    ]
  }
  return null
}
