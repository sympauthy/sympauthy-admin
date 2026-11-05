import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useRouteAccess } from '@/shared/auth'

/**
 * The views one account is read through, each a route of its own. A view names itself and carries
 * its explanation, both read under the route it opens.
 *
 * A view the token cannot read is not offered: consents come from the consent surface under a scope
 * of their own, so this record opens on `admin:users:read` alone and drops the one view that needs
 * more rather than painting a refusal into it.
 */
export function useUserViews() {
  const route = useRoute()
  const { t } = useI18n()
  const { canOpen } = useRouteAccess()

  return computed(() => {
    const params = { userId: route.params.userId as string }
    return (['userClaims', 'userConsents', 'userMfa', 'userProviders'] as const)
      .filter((name) => canOpen(name, params))
      .map((name) => ({
        name,
        label: t(`pages.${name}.title`),
        description: t(`pages.${name}.summary`),
        to: { name, params },
        help: `pages.${name}`
      }))
  })
}
