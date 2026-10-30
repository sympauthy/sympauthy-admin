import { useRouter, type Router, type RouteParamsRawGeneric } from 'vue-router'
import { translateMessage } from '@/shared/i18n'
import { useAuthStore } from './useAuthStore'

/**
 * The scopes a route requires that the token was not granted, read from the `requiredScopes` that
 * route states — or `undefined` for a name the router does not know.
 *
 * An unknown name answers rather than throws: `router.resolve` rejects one, and a navigation built
 * from a list of them — the sidebar, a record's tab strip — would take the render that drew it down
 * with it. A renamed route costs its entry, not the screen.
 */
export function missingRouteScopes(
  router: Router,
  name: string,
  params?: RouteParamsRawGeneric
): string[] | undefined {
  if (!router.hasRoute(name)) {
    return undefined
  }
  const required = router.resolve({ name, params }).meta.requiredScopes ?? []
  return useAuthStore().missingScopes(required)
}

/** Whether the token may open a route: one the router knows, every scope of which was granted. */
export function canOpenRoute(
  router: Router,
  name: string,
  params?: RouteParamsRawGeneric
): boolean {
  return missingRouteScopes(router, name, params)?.length === 0
}

/**
 * The sentence a disabled control says itself with, naming the scopes [scopes] holds — or
 * `undefined` where it holds none, and the control is not disabled for them.
 */
export function missingScopesHint(scopes: string[]): string | undefined {
  return scopes.length > 0
    ? translateMessage('common.missingScopes', { scopes: scopes.join(', ') })
    : undefined
}

/**
 * [canOpenRoute] and [missingRouteScopes] against the router of the component calling them.
 *
 * The scopes a screen needs are declared once, on its route, so a navigation drawing links reads
 * what the guard would refuse instead of repeating the list beside every link.
 */
export function useRouteAccess() {
  const router = useRouter()

  function canOpen(name: string, params?: RouteParamsRawGeneric): boolean {
    return canOpenRoute(router, name, params)
  }

  function missingScopes(name: string, params?: RouteParamsRawGeneric): string[] | undefined {
    return missingRouteScopes(router, name, params)
  }

  return { canOpen, missingScopes }
}
