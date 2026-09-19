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
import { SessionDetailPage } from '@/pages/session-detail'
import { CallbackPage } from '@/pages/callback'
import { RegisterPage } from '@/pages/register'
import { useAuthStore } from '@/shared/auth'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiredRoles?: string[]
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
        path: '/',
        redirect: '/users'
      },
      {
        path: '/users',
        name: 'users',
        component: UsersPage,
        meta: { requiresAuth: true, breadcrumb: { label: 'nav.users' } }
      },
      {
        path: '/users/:userId',
        name: 'userDetail',
        component: UserDetailPage,
        meta: {
          requiresAuth: true,
          breadcrumb: { label: 'pages.userDetail.title', parent: 'users' }
        }
      },
      {
        path: '/clients',
        name: 'clients',
        component: ClientsPage,
        meta: { requiresAuth: true, breadcrumb: { label: 'nav.clients' } }
      },
      {
        path: '/clients/:clientId',
        name: 'clientDetail',
        component: ClientDetailPage,
        meta: {
          requiresAuth: true,
          breadcrumb: { label: 'pages.clientDetail.title', parent: 'clients' }
        }
      },
      {
        path: '/claims',
        name: 'claims',
        component: ClaimsPage,
        meta: { requiresAuth: true, breadcrumb: { label: 'nav.claims' } }
      },
      {
        path: '/scopes',
        name: 'scopes',
        component: ScopesPage,
        meta: { requiresAuth: true, breadcrumb: { label: 'nav.scopes' } }
      },
      {
        path: '/audiences',
        name: 'audiences',
        component: AudiencesPage,
        meta: { requiresAuth: true, breadcrumb: { label: 'nav.audiences' } }
      },
      {
        path: '/invitations',
        name: 'invitations',
        component: InvitationsPage,
        meta: { requiresAuth: true, breadcrumb: { label: 'nav.invitations' } }
      },
      {
        path: '/sessions',
        name: 'sessions',
        component: SessionsPage,
        meta: { requiresAuth: true, breadcrumb: { label: 'nav.sessions' } }
      },
      {
        path: '/sessions/:sessionId',
        name: 'sessionDetail',
        component: SessionDetailPage,
        meta: {
          requiresAuth: true,
          breadcrumb: { label: 'pages.sessionDetail.title', parent: 'sessions' }
        }
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

    const requiredRoles = to.meta.requiredRoles
    if (requiredRoles && requiredRoles.length > 0) {
      if (!authStore.hasAnyRole(requiredRoles)) {
        return { name: 'users' }
      }
    }

    return true
  })

  return router
}
