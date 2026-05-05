import { createRouter, createWebHistory } from 'vue-router'
import AudiencesPage from '@/pages/AudiencesPage.vue'
import InvitationsPage from '@/pages/InvitationsPage.vue'
import ClientsPage from '@/pages/ClientsPage.vue'
import ClientDetailPage from '@/pages/clientdetail/ClientDetailPage.vue'
import ClaimsPage from '@/pages/ClaimsPage.vue'
import ScopesPage from '@/pages/ScopesPage.vue'
import UsersPage from '@/pages/UsersPage.vue'
import UserDetailPage from '@/pages/userdetail/UserDetailPage.vue'
import CallbackPage from '@/pages/CallbackPage.vue'
import RegisterPage from '@/pages/RegisterPage.vue'
import { useAuthStore } from '@/stores/useAuthStore'

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
