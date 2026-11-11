import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  interactiveFlowSessionEndedInFailure,
  useInteractiveFlowSessionDetailStore
} from '@/entities/session'

/**
 * The views one session is read through, each a route of its own. A view names itself and carries
 * its explanation, both read under the route it opens.
 *
 * Why a session ended where it did is a view of its own rather than a panel above the views: it
 * belongs to a session that ended in a failure, and a section held for some would cost every
 * session the height it takes. It comes first, since it is the question an operator opens such a
 * session with — the record still falls back to the purposes, which every session has.
 */
export function useInteractiveFlowSessionViews() {
  const route = useRoute()
  const { t } = useI18n()
  const store = useInteractiveFlowSessionDetailStore()

  return computed(() => {
    const params = { sessionId: route.params.sessionId as string }
    const failure =
      store.session && interactiveFlowSessionEndedInFailure(store.session.status)
        ? (['sessionFailure'] as const)
        : []
    return [...failure, 'sessionPurposes', 'sessionSecurityContexts'].map((name) => ({
      name,
      label: t(`pages.${name}.title`),
      description: t(`pages.${name}.summary`),
      to: { name, params },
      help: `pages.${name}`
    }))
  })
}
