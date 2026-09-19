# Authentication

The panel is an ordinary public client of the server it administers. It holds no credential of its
own: an operator signs in through the server's own interactive flow, and what comes back is an
access token carrying the admin scopes. [`shared/auth`](../src/shared/auth) is the whole of it —
`AuthService` wraps [oidc-client-ts](https://github.com/authts/oidc-client-ts), and `useAuthStore`
is what the rest of the panel reads.

## The client

The settings are built once, in `AuthService`, from the `VITE_OIDC_*` environment variables, and
each one falls back to a value derived from where the panel is served:

| Setting | Comes from | Falls back to |
| --- | --- | --- |
| `authority` | `VITE_OIDC_AUTHORITY` | `window.location.origin` |
| `client_id` | `VITE_OIDC_CLIENT_ID` | — |
| `scope` | `VITE_OIDC_SCOPE` | — |
| `redirect_uri` | `VITE_OIDC_REDIRECT_URI` | `<origin><base path>/callback` |
| `post_logout_redirect_uri` | `VITE_OIDC_POST_LOGOUT_REDIRECT_URI` | `<origin><base path>` |

The base path is the one Vite was built with, so a panel served under a sub-path of the
authorization server derives its own URLs without being reconfigured. The authority is the server
root either way, since that is what publishes the discovery document.

The flow is authorization code with PKCE and a DPoP-bound code. The user and the tokens are kept in
`localStorage`, the DPoP key pair in IndexedDB, and silent renewal is left on.

## Signing in

A navigation is guarded by `router.beforeEach`:

1. The store is initialized on the first navigation, which loads a user already in storage.
2. A route stating `requiresAuth: false` — `/callback` and `/register` — is let through.
3. An unauthenticated navigation tries a silent renew first, and only redirects to the authorization
   server when there is nothing to renew. The route it was heading to is carried in the OIDC `state`
   as `targetUrl`.
4. A route naming `requiredRoles` that the user has none of redirects to `/users`.

`/callback` is a layout-less route: it exchanges the code, then replaces itself with the
`targetUrl` the state carried. A failure there is the one place a sign-in error is rendered.

`/register` is the entry point of an invitation. It takes the `invitation_token` query parameter —
or a token typed into the form — and passes it to the authorization server as an extra query
parameter on the sign-in redirect, which is what lets a new operator claim the invitation and come
back signed in.

## Staying signed in

**A request carries the token, and nothing else renews it.** `AbstractApi` reads
`useAuthStore().accessToken` for every call and sets the bearer header itself.

**A 401 is answered by one silent renew and one retry.** When the renewal fails the call resolves to
an `api.unauthorized` error rather than throwing, so the screen that made it shows a message.
[The API standard](api-standard.md) owns that contract.

**A session lost outside a request is caught by `App.vue`**, which watches the store and redirects
to the authorization server when an authenticated user becomes an anonymous one — a renewal that
failed in the background, or a sign-out elsewhere.

**Signing out is a redirect to the server's end-session endpoint.** The sidebar calls
`authStore.signout()`, and the server decides where the operator lands.

## What the token says

The store exposes the profile the server issued: `userName`, `userEmail`, `userRoles` and the
`accessToken`. `hasRole` and `hasAnyRole` answer the route guard.

What the panel may call is decided by the scopes it asks for — the `VITE_OIDC_SCOPE` list in
[`.env`](../.env), one scope per admin capability the screens use. Adding a screen that calls a new
admin endpoint means adding its scope there, and the server refusing a scope is what an operator
sees rather than a hidden failure.

## What this document does not cover

**Authorization inside a screen.** No route names `requiredRoles` today, and a call the token is not
scoped for fails at the server.

**The interactive flow itself.** It is served by the authorization server and rendered by the
[flow application](https://github.com/sympauthy/sympauthy-flow); the panel only leaves and returns.

---

← [Design documentation](index.md)
