import type { Router } from 'vue-router'
import type { SaFilterCriterion, SaSortKey } from '@sympauthy/design'
import type { CollectionCapabilitiesResource } from '@/shared/api'

/**
 * What a phone's list held when the operator opened one of its rows, so that coming back finds the
 * rows they had scrolled through and the place they were at. A list from `sm:` holds one page,
 * which reading again costs one request and no scroll, so it keeps nothing.
 */
export interface CollectionReturn {
  items: unknown[]
  page: number
  total: number
  query: string
  filters: SaFilterCriterion[]
  sort: SaSortKey[]
  capabilities: CollectionCapabilitiesResource | null
  scrollTop: number
}

// Keyed by the path of the screen listing the collection.
const kept = new Map<string, CollectionReturn>()
const pruning = new WeakSet<Router>()

/**
 * Whether [path] is the screen at [listPath] or one under it, which is where its rows lead: a
 * record's path nests under the path of the list holding it, and a view under the record's.
 */
export function collectionReturnWithin(path: string, listPath: string): boolean {
  return path === listPath || path.startsWith(`${listPath}/`)
}

/**
 * Keeps what the list at [listPath] held until the operator comes back to it, by whatever link, or
 * goes anywhere that is not under it: the list reached from elsewhere is one they start over on.
 */
export function keepCollectionReturn(router: Router, listPath: string, held: CollectionReturn) {
  kept.set(listPath, held)
  if (pruning.has(router)) {
    return
  }
  pruning.add(router)
  router.afterEach((to, _from, failure) => {
    if (failure) {
      return
    }
    for (const path of kept.keys()) {
      if (!collectionReturnWithin(to.path, path)) {
        kept.delete(path)
      }
    }
  })
}

/** What the list at [listPath] held when the operator left it for one of its rows, once. */
export function takeCollectionReturn(listPath: string): CollectionReturn | undefined {
  const held = kept.get(listPath)
  kept.delete(listPath)
  return held
}
