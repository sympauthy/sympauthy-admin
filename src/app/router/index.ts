import { createRouter, createWebHistory } from 'vue-router'
import { useIsPhone } from '@/shared/lib'
import { AudiencesPage } from '@/pages/audiences'
import { InvitationsPage } from '@/pages/invitations'
import { ClientsPage } from '@/pages/clients/list'
import { ClientDetailPage } from '@/pages/clients/detail'
import { ClaimsPage } from '@/pages/claims'
import { ScopesPage } from '@/pages/scopes'
import { UsersPage } from '@/pages/users/list'
import { SessionsPage } from '@/pages/sessions/list'
import { GrantsPage } from '@/pages/grants/list'
import { GrantDetailPage } from '@/pages/grants/detail'
import { UserDetailPage, UserViewsPage } from '@/pages/users/detail'
import { UserClaimsPage } from '@/pages/users/claims'
import { UserConsentsPage } from '@/pages/users/consents'
import { UserMfaPage } from '@/pages/users/mfa'
import { UserProvidersPage } from '@/pages/users/providers'
import { SessionDetailPage, SessionViewsPage } from '@/pages/sessions/detail'
import { SessionPurposesPage } from '@/pages/sessions/purposes'
import { SessionSecurityContextsPage } from '@/pages/sessions/security-contexts'
import { SessionFailurePage } from '@/pages/sessions/failure'
import { CallbackPage } from '@/pages/callback'
import { NoAccessPage } from '@/pages/no-access'
import { RegisterPage } from '@/pages/register'
import { canOpenRoute, useAuthStore } from '@/shared/auth'
import { navEntries } from './navigation'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    /**
     * The admin scopes the token must carry for this route to open, every one of them. A route
     * under another states the whole set rather than the difference, since a child's `meta`
     * replaces its parent's key rather than adding to it.
     */
    requiredScopes?: string[]
    noLayout?: boolean
    breadcrumb?: {
      label: string
      parent?: string
    }
    /**
     * Names a view of a record, which a phone opens as a screen of its own and a wider screen draws
     * as a tab. `record` is the route it goes back to.
     */
    view?: {
      label: string
      record: string
    }
  }
}

export function makeRouter() {
  const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
      {
        path: '/callback',
        name: 'callback',
        component: CallbackPage,
        meta: { requiresAuth: false, noLayout: true }
      },
      {
        path: '/register',
        name: 'register',
        component: RegisterPage,
        meta: { requiresAuth: false, noLayout: true }
      },
      {
        // The panel's root, and the answer for a token that can open none of it. The guard sends
        // it on to the first page of the navigation the token does open, so the page below renders
        // only when there is no such page — which is why this is not a redirect: where it leads
        // depends on a token the router has not read yet when a redirect would be resolved.
        path: '/',
        name: 'noAccess',
        component: NoAccessPage,
        meta: { requiresAuth: true, noLayout: true }
      },
      {
        path: '/users',
        name: 'users',
        component: UsersPage,
        meta: {
          requiresAuth: true,
          requiredScopes: ['admin:users:read'],
          breadcrumb: { label: 'nav.users' }
        }
      },
      {
        // The record's shell. Each of its collections is a view, and each view is a route, so the
        // one an operator is on is addressable. Landing on the record itself lists them on a phone
        // and opens the first of them on a wider screen, which keeps
        // `router.push({ name: 'userDetail' })` working from the list.
        path: '/users/:userId',
        component: UserDetailPage,
        meta: {
          requiresAuth: true,
          requiredScopes: ['admin:users:read'],
          breadcrumb: { label: 'pages.userDetail.title', parent: 'users' }
        },
        children: [
          {
            path: '',
            name: 'userDetail',
            component: UserViewsPage,
            meta: { requiresAuth: true },
            beforeEnter: (to) => useIsPhone().value || { name: 'userClaims', params: to.params }
          },
          {
            path: 'claims',
            name: 'userClaims',
            component: UserClaimsPage,
            meta: {
              requiresAuth: true,
              view: { label: 'pages.userClaims.title', record: 'userDetail' }
            }
          },
          {
            // The one view of the record whose collection is not read under `admin:users:read`:
            // consents come from the consent surface, and an operator can hold one scope and not
            // the other.
            path: 'consents',
            name: 'userConsents',
            component: UserConsentsPage,
            meta: {
              requiresAuth: true,
              requiredScopes: ['admin:users:read', 'admin:consent:read'],
              view: { label: 'pages.userConsents.title', record: 'userDetail' }
            }
          },
          {
            path: 'mfa',
            name: 'userMfa',
            component: UserMfaPage,
            meta: {
              requiresAuth: true,
              view: { label: 'pages.userMfa.title', record: 'userDetail' }
            }
          },
          {
            path: 'providers',
            name: 'userProviders',
            component: UserProvidersPage,
            meta: {
              requiresAuth: true,
              view: { label: 'pages.userProviders.title', record: 'userDetail' }
            }
          }
        ]
      },
      {
        path: '/clients',
        name: 'clients',
        component: ClientsPage,
        meta: {
          requiresAuth: true,
          requiredScopes: ['admin:config:read'],
          breadcrumb: { label: 'nav.clients' }
        }
      },
      {
        path: '/clients/:clientId',
        name: 'clientDetail',
        component: ClientDetailPage,
        meta: {
          requiresAuth: true,
          requiredScopes: ['admin:config:read'],
          breadcrumb: { label: 'pages.clientDetail.title', parent: 'clients' }
        }
      },
      {
        path: '/claims',
        name: 'claims',
        component: ClaimsPage,
        meta: {
          requiresAuth: true,
          requiredScopes: ['admin:config:read'],
          breadcrumb: { label: 'nav.claims' }
        }
      },
      {
        path: '/scopes',
        name: 'scopes',
        component: ScopesPage,
        meta: {
          requiresAuth: true,
          requiredScopes: ['admin:config:read'],
          breadcrumb: { label: 'nav.scopes' }
        }
      },
      {
        path: '/audiences',
        name: 'audiences',
        component: AudiencesPage,
        meta: {
          requiresAuth: true,
          requiredScopes: ['admin:config:read'],
          breadcrumb: { label: 'nav.audiences' }
        }
      },
      {
        path: '/invitations',
        name: 'invitations',
        component: InvitationsPage,
        meta: {
          requiresAuth: true,
          requiredScopes: ['admin:invitations:read'],
          breadcrumb: { label: 'nav.invitations' }
        }
      },
      {
        path: '/grants',
        name: 'grants',
        component: GrantsPage,
        meta: {
          requiresAuth: true,
          requiredScopes: ['admin:grants:read'],
          breadcrumb: { label: 'nav.grants' }
        }
      },
      {
        path: '/grants/:grantId',
        name: 'grantDetail',
        component: GrantDetailPage,
        meta: {
          requiresAuth: true,
          requiredScopes: ['admin:grants:read'],
          breadcrumb: { label: 'pages.grantDetail.title', parent: 'grants' }
        }
      },
      {
        path: '/sessions',
        name: 'sessions',
        component: SessionsPage,
        meta: {
          requiresAuth: true,
          requiredScopes: ['admin:interactive-flow-sessions:read'],
          breadcrumb: { label: 'nav.sessions' }
        }
      },
      {
        // The record's shell, laid out as the user's: landing on it lists its views on a phone and
        // opens the purposes on a wider screen.
        path: '/sessions/:sessionId',
        component: SessionDetailPage,
        meta: {
          requiresAuth: true,
          requiredScopes: ['admin:interactive-flow-sessions:read'],
          breadcrumb: { label: 'pages.sessionDetail.title', parent: 'sessions' }
        },
        children: [
          {
            path: '',
            name: 'sessionDetail',
            component: SessionViewsPage,
            meta: { requiresAuth: true },
            beforeEnter: (to) =>
              useIsPhone().value || { name: 'sessionPurposes', params: to.params }
          },
          {
            path: 'purposes',
            name: 'sessionPurposes',
            component: SessionPurposesPage,
            meta: {
              requiresAuth: true,
              view: { label: 'pages.sessionPurposes.title', record: 'sessionDetail' }
            }
          },
          {
            path: 'security-contexts',
            name: 'sessionSecurityContexts',
            component: SessionSecurityContextsPage,
            meta: {
              requiresAuth: true,
              view: { label: 'pages.sessionSecurityContexts.title', record: 'sessionDetail' }
            }
          },
          {
            path: 'failure',
            name: 'sessionFailure',
            component: SessionFailurePage,
            meta: {
              requiresAuth: true,
              view: { label: 'pages.sessionFailure.title', record: 'sessionDetail' }
            }
          }
        ]
      }
    ]
  })

  router.beforeEach(async (to) => {
    const authStore = useAuthStore()

    if (!authStore.initialized) {
      await authStore.initialize()
    }

    if (to.meta.requiresAuth === false) {
      return true
    }

    if (!authStore.isAuthenticated) {
      const renewed = await authStore.trySilentRenew()
      if (!renewed) {
        await authStore.signinRedirect(to.fullPath)
        return false
      }
    }

    if (to.name === 'noAccess') {
      const landing = navEntries.find((entry) => canOpenRoute(router, entry.name))
      return landing ? { name: landing.name } : true
    }

    // A screen the token cannot read is not shown failing: the operator is sent back to the root,
    // which lands them on whatever they can open.
    if (!authStore.hasAllScopes(to.meta.requiredScopes ?? [])) {
      return { name: 'noAccess' }
    }

    return true
  })

  return router
}
