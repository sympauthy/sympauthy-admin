import {
  UserManager,
  type User,
  type UserManagerSettings,
  WebStorageStateStore
} from 'oidc-client-ts'

export type AuthUser = {
  sub: string
  name: string
  email: string
  roles: string[]
  accessToken: string
}

function makeUserManagerSettings(): UserManagerSettings {
  return {
    authority: import.meta.env.VITE_OIDC_AUTHORITY,
    client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_OIDC_REDIRECT_URI,
    post_logout_redirect_uri: import.meta.env.VITE_OIDC_POST_LOGOUT_REDIRECT_URI,
    scope: import.meta.env.VITE_OIDC_SCOPE,
    response_type: 'code',
    automaticSilentRenew: true,
    userStore: new WebStorageStateStore({ store: window.localStorage })
  }
}

export class AuthService {
  private readonly userManager: UserManager

  constructor() {
    this.userManager = new UserManager(makeUserManagerSettings())
  }

  onUserLoaded(callback: (user: User) => void): void {
    this.userManager.events.addUserLoaded(callback)
  }

  onUserUnloaded(callback: () => void): void {
    this.userManager.events.addUserUnloaded(callback)
  }

  onSilentRenewError(callback: (error: Error) => void): void {
    this.userManager.events.addSilentRenewError(callback)
  }

  async getUser(): Promise<User | null> {
    const user = await this.userManager.getUser()
    if (user && !user.expired) {
      return user
    }
    return null
  }

  /**
   * Check if there is any user in storage (even expired).
   * Used to decide whether a silent renew is worth attempting.
   */
  async hasUserInStorage(): Promise<boolean> {
    const user = await this.userManager.getUser()
    return user !== null
  }

  async trySilentRenew(): Promise<User | null> {
    // Only attempt silent renew if there's an existing session to renew.
    // Without this, oidc-client-ts tries an iframe-based auth which times out.
    if (!(await this.hasUserInStorage())) {
      return null
    }
    try {
      return await this.userManager.signinSilent()
    } catch (error) {
      console.error('Silent renew failed.', error)
      return null
    }
  }

  async signinRedirect(targetUrl?: string): Promise<void> {
    await this.userManager.signinRedirect({
      state: { targetUrl: targetUrl ?? '/' }
    })
  }

  async signinRedirectCallback(): Promise<User> {
    return await this.userManager.signinRedirectCallback()
  }

  async signout(): Promise<void> {
    await this.userManager.signoutRedirect()
  }

  static toAuthUser(user: User): AuthUser {
    const profile = user.profile
    return {
      sub: profile.sub,
      name: ((profile.name ?? profile.preferred_username ?? profile.sub) as string),
      email: ((profile.email ?? '') as string),
      roles: Array.isArray(profile.roles) ? (profile.roles as string[]) : [],
      accessToken: user.access_token
    }
  }
}
