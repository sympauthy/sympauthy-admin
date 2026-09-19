/**
 * What a collection reads off a request beside its criteria.
 *
 * A criterion is not a parameter anything declares: it is named by the field it filters on, so it
 * arrives through the index signature and is resolved against what the collection published. A
 * collection reading a parameter of its own — `/admin/users`'s `claims` — extends this and names
 * it.
 */
export interface CollectionParams {
  page?: number
  size?: number
  sort?: string
  q?: string
  [key: string]: string | number | undefined
}
