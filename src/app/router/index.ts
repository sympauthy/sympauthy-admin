import { createRouter, createWebHistory } from 'vue-router'
import AudiencesPage from '@/pages/audiences/AudiencesPage.vue'
import InvitationsPage from '@/pages/invitations/InvitationsPage.vue'
import ClientsPage from '@/pages/clients/ClientsPage.vue'
import ClientDetailPage from '@/pages/client-detail/ClientDetailPage.vue'
import ClaimsPage from '@/pages/claims/ClaimsPage.vue'
import ScopesPage from '@/pages/scopes/ScopesPage.vue'
import UsersPage from '@/pages/users/UsersPage.vue'
import SessionsPage from '@/pages/sessions/SessionsPage.vue'
import UserDetailPage from '@/pages/user-detail/UserDetailPage.vue'
import SessionDetailPage from '@/pages/session-detail/SessionDetailPage.vue'
import CallbackPage from '@/pages/callback/CallbackPage.vue'
import RegisterPage from '@/pages/register/RegisterPage.vue'
import { useAuthStore } from '@/shared/auth/useAuthStore'

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
