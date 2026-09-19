/**
 * A body holding a page of records, which is the shape every collection answers with.
 *
 * A collection's own list resource extends it with the records themselves, under the plural of what
 * it holds.
 */
export interface CollectionPageResource {
  page: number
  size: number
  total: number
}
