import { createRouter, createWebHistory } from 'vue-router'
import DashboardPage from '@/pages/DashboardPage.vue'
import ClientsPage from '@/pages/ClientsPage.vue'
import ClaimsPage from '@/pages/ClaimsPage.vue'
import UsersPage from '@/pages/UsersPage.vue'
import CallbackPage from '@/pages/CallbackPage.vue'
import { useAuthStore } from '@/stores/useAuthStore'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiredRoles?: string[]
    noLayout?: boolean
  }
}

export function makeRouter() {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/callback',
        name: 'callback',
        component: CallbackPage,
        meta: { requiresAuth: false, noLayout: true }
      },
      {
        path: '/',
        name: 'dashboard',
        component: DashboardPage,
        meta: { requiresAuth: true }
      },
      {
        path: '/users',
        name: 'users',
        component: UsersPage,
        meta: { requiresAuth: true }
      },
      {
        path: '/clients',
        name: 'clients',
        component: ClientsPage,
        meta: { requiresAuth: true }
      },
      {
        path: '/claims',
        name: 'claims',
        component: ClaimsPage,
        meta: { requiresAuth: true }
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
        return { name: 'dashboard' }
      }
    }

    return true
  })

  return router
}
