import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AuthService, type AuthUser } from './AuthService'
import type { User } from 'oidc-client-ts'

export const useAuthStore = defineStore('auth', () => {
  const authService = new AuthService()
  const user = ref<AuthUser | null>(null)
  const initialized = ref(false)
  const loading = ref(true)

  const isAuthenticated = computed(() => user.value !== null)
  const userName = computed(() => user.value?.name ?? '')
  const userEmail = computed(() => user.value?.email ?? '')
  const grantedScopes = computed(() => user.value?.scopes ?? [])
  const accessToken = computed(() => user.value?.accessToken ?? '')

  function hasScope(scope: string): boolean {
    return grantedScopes.value.includes(scope)
  }

  function hasAllScopes(scopes: string[]): boolean {
    return scopes.every(hasScope)
  }

  function setUser(oidcUser: User | null): void {
    user.value = oidcUser ? AuthService.toAuthUser(oidcUser) : null
  }

  async function initialize(): Promise<void> {
    if (initialized.value) return

    authService.onUserLoaded((oidcUser: User) => {
      setUser(oidcUser)
    })

    authService.onUserUnloaded(() => {
      user.value = null
    })

    authService.onSilentRenewError((error: Error) => {
      console.error('Silent renew error.', error)
      user.value = null
    })

    const existingUser = await authService.getUser()
    if (existingUser) {
      setUser(existingUser)
    }

    initialized.value = true
    loading.value = false
  }

  async function trySilentRenew(): Promise<boolean> {
    const renewedUser = await authService.trySilentRenew()
    if (renewedUser) {
      setUser(renewedUser)
      return true
    }
    return false
  }

  async function signinRedirect(
    targetUrl?: string,
    extraQueryParams?: Record<string, string>
  ): Promise<void> {
    await authService.signinRedirect(targetUrl, extraQueryParams)
  }

  async function signinRedirectCallback(): Promise<string> {
    const oidcUser = await authService.signinRedirectCallback()
    setUser(oidcUser)
    const state = oidcUser.state as { targetUrl?: string } | undefined
    return state?.targetUrl ?? '/'
  }

  async function signout(): Promise<void> {
    await authService.signout()
  }

  return {
    user,
    initialized,
    loading,
    isAuthenticated,
    userName,
    userEmail,
    grantedScopes,
    accessToken,
    hasScope,
    hasAllScopes,
    initialize,
    trySilentRenew,
    signinRedirect,
    signinRedirectCallback,
    signout
  }
})
