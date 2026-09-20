import { createRouter, createWebHistory } from 'vue-router'
import { AudiencesPage } from '@/pages/audiences'
import { InvitationsPage } from '@/pages/invitations'
import { ClientsPage } from '@/pages/clients'
import { ClientDetailPage } from '@/pages/client-detail'
import { ClaimsPage } from '@/pages/claims'
import { ScopesPage } from '@/pages/scopes'
import { UsersPage } from '@/pages/users'
import { SessionsPage } from '@/pages/sessions'
import { UserDetailPage } from '@/pages/user-detail'
import { UserClaimsPage } from '@/pages/user-claims'
import { UserConsentsPage } from '@/pages/user-consents'
import { UserMfaPage } from '@/pages/user-mfa'
import { UserProvidersPage } from '@/pages/user-providers'
import { SessionDetailPage } from '@/pages/session-detail'
import { SessionPurposesPage } from '@/pages/session-purposes'
import { SessionSecurityContextsPage } from '@/pages/session-security-contexts'
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
        // The record's shell. Each of its collections is a tab, and each tab is a route, so the
        // view an operator is on is addressable. Landing on the record itself opens the first of
        // them, which keeps `router.push({ name: 'userDetail' })` working from the list.
        path: '/users/:userId',
        name: 'userDetail',
        component: UserDetailPage,
        redirect: { name: 'userClaims' },
        meta: {
          requiresAuth: true,
          requiredScopes: ['admin:users:read'],
          breadcrumb: { label: 'pages.userDetail.title', parent: 'users' }
        },
        children: [
          {
            path: 'claims',
            name: 'userClaims',
            component: UserClaimsPage,
            meta: { requiresAuth: true }
          },
          {
            // The one tab of the record whose collection is not read under `admin:users:read`:
            // consents come from the consent surface, and an operator can hold one scope and not
            // the other.
            path: 'consents',
            name: 'userConsents',
            component: UserConsentsPage,
            meta: {
              requiresAuth: true,
              requiredScopes: ['admin:users:read', 'admin:consent:read']
            }
          },
          {
            path: 'mfa',
            name: 'userMfa',
            component: UserMfaPage,
            meta: { requiresAuth: true }
          },
          {
            path: 'providers',
            name: 'userProviders',
            component: UserProvidersPage,
            meta: { requiresAuth: true }
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
        path: '/sessions/:sessionId',
        name: 'sessionDetail',
        component: SessionDetailPage,
        redirect: { name: 'sessionPurposes' },
        meta: {
          requiresAuth: true,
          requiredScopes: ['admin:interactive-flow-sessions:read'],
          breadcrumb: { label: 'pages.sessionDetail.title', parent: 'sessions' }
        },
        children: [
          {
            path: 'purposes',
            name: 'sessionPurposes',
            component: SessionPurposesPage,
            meta: { requiresAuth: true }
          },
          {
            path: 'security-contexts',
            name: 'sessionSecurityContexts',
            component: SessionSecurityContextsPage,
            meta: { requiresAuth: true }
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
