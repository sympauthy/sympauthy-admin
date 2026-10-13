import {
  UserManager,
  type User,
  type UserManagerSettings,
  WebStorageStateStore,
  IndexedDbDPoPStore
} from 'oidc-client-ts'

export type AuthUser = {
  sub: string
  name: string
  email: string
  /** The scopes the server granted, parsed from the `scope` of the token response. */
  scopes: string[]
}

/**
 * Return the absolute base URL of this application (e.g. "http://localhost:8080/admin").
 *
 * Combines `window.location.origin` with the base path configured via Vite's `base` option
 * (`import.meta.env.BASE_URL`), stripping any trailing slash so callers can safely append paths.
 */
function getBaseUrl(): string {
  const basePath = import.meta.env.BASE_URL.replace(/\/+$/, '')
  return `${window.location.origin}${basePath}`
}

function makeUserManagerSettings(): UserManagerSettings {
  const baseUrl = getBaseUrl()
  return {
    // Authority points to the authorization server root, not the admin UI base path.
    authority: import.meta.env.VITE_OIDC_AUTHORITY || window.location.origin,
    client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_OIDC_REDIRECT_URI || `${baseUrl}/callback`,
    post_logout_redirect_uri: import.meta.env.VITE_OIDC_POST_LOGOUT_REDIRECT_URI || baseUrl,
    // With `VITE_OIDC_SCOPE` unset the authorization request carries no `scope` at all, and the
    // server applies the admin client's own `default-scopes`. `SigninRequest.create` rejects a
    // falsy `scope` before it reads the flag, so the placeholder below stays and never reaches the
    // wire.
    scope: import.meta.env.VITE_OIDC_SCOPE || 'openid',
    omitScopeWhenRequesting: !import.meta.env.VITE_OIDC_SCOPE,
    response_type: 'code',
    automaticSilentRenew: true,
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    dpop: {
      bind_authorization_code: true,
      store: new IndexedDbDPoPStore()
    }
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

  async signinRedirect(
    targetUrl?: string,
    extraQueryParams?: Record<string, string>
  ): Promise<void> {
    await this.userManager.signinRedirect({
      state: { targetUrl: targetUrl ?? '/' },
      extraQueryParams
    })
  }

  async signinRedirectCallback(): Promise<User> {
    return await this.userManager.signinRedirectCallback()
  }

  async signout(): Promise<void> {
    await this.userManager.signoutRedirect()
  }

  /**
   * Return the headers presenting the stored access token on a `method` request to `path` of the
   * authorization server, or none when no user is stored.
   *
   * The scheme is the `token_type` the token response named, since the server refuses a token bound
   * to a key presented as a bearer token, and one bound to none presented under the `DPoP` scheme. A
   * bound token goes out beside a proof minted for this one request, so each attempt — a retry
   * included — calls this again rather than reusing the headers of the last.
   */
  async makeAuthorizationHeaders(method: string, path: string): Promise<Record<string, string>> {
    const user = await this.userManager.getUser()
    if (!user) {
      return {}
    }
    if (user.token_type.toLowerCase() !== 'dpop') {
      return { Authorization: `Bearer ${user.access_token}` }
    }
    const headers: Record<string, string> = { Authorization: `DPoP ${user.access_token}` }
    const proof = await this.userManager.dpopProof(
      this.getServerUrl(path),
      user,
      method.toUpperCase()
    )
    if (proof) {
      headers.DPoP = proof
    }
    return headers
  }

  /**
   * Return the URL the authorization server knows `path` by: the authority, which is its root, with
   * `path` appended.
   *
   * A proof names this rather than the URL the request went to, because the server compares its
   * `htu` with its own configured root joined to the request path, whatever host the request arrived
   * on. Under `npm run dev` the request goes to the dev server's proxy, and a proof naming that is
   * refused.
   */
  private getServerUrl(path: string): string {
    return `${this.userManager.settings.authority.replace(/\/+$/, '')}${path}`
  }

  static toAuthUser(user: User): AuthUser {
    const profile = user.profile
    return {
      sub: profile.sub,
      name: (profile.name ?? profile.preferred_username ?? profile.sub) as string,
      email: (profile.email ?? '') as string,
      scopes: user.scopes
    }
  }
}
