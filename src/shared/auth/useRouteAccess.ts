import { useRouter, type Router, type RouteParamsRawGeneric } from 'vue-router'
import { useAuthStore } from './useAuthStore'

/**
 * Whether the token may open a route, answered from the `requiredScopes` that route states.
 *
 * A name the router does not know answers `false` rather than throwing: `router.resolve` rejects an
 * unknown name, and a navigation built from a list of them — the sidebar, a record's tab strip —
 * would take the render that drew it down with it. A renamed route costs its entry, not the screen.
 */
export function canOpenRoute(
  router: Router,
  name: string,
  params?: RouteParamsRawGeneric
): boolean {
  if (!router.hasRoute(name)) {
    return false
  }
  return useAuthStore().hasAllScopes(router.resolve({ name, params }).meta.requiredScopes ?? [])
}

/**
 * [canOpenRoute] against the router of the component calling it.
 *
 * The scopes a screen needs are declared once, on its route, so a navigation drawing links hides
 * what the guard would refuse instead of repeating the list beside every link.
 */
export function useRouteAccess() {
  const router = useRouter()

  function canOpen(name: string, params?: RouteParamsRawGeneric): boolean {
    return canOpenRoute(router, name, params)
  }

  return { canOpen }
}
