import { useRouter, type RouteParamsRawGeneric } from 'vue-router'
import { useAuthStore } from './useAuthStore'

/**
 * Whether the token may open a route, answered from the `requiredScopes` that route states.
 *
 * A screen names the scopes it needs once, on its route, so a navigation drawing links into the
 * panel — the sidebar, a record's tab strip — hides what the guard would refuse instead of
 * repeating the list beside every link.
 */
export function useRouteAccess() {
  const router = useRouter()
  const authStore = useAuthStore()

  function canOpen(name: string, params?: RouteParamsRawGeneric): boolean {
    return authStore.hasAllScopes(router.resolve({ name, params }).meta.requiredScopes ?? [])
  }

  return { canOpen }
}
