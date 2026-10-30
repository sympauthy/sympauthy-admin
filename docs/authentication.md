# Authentication

The panel is an ordinary public client of the server it administers. It holds no credential of its
own: an operator signs in through the server's own interactive flow, and what comes back is an
access token carrying the admin scopes. [`shared/auth`](../src/shared/auth) is the whole of it —
`AuthService` wraps [oidc-client-ts](https://github.com/authts/oidc-client-ts), `useAuthStore` is
what the rest of the panel reads, and `useRouteAccess` answers whether the token opens a route.

## The client

The settings are built once, in `AuthService`, from the `VITE_OIDC_*` environment variables, and
each one falls back to a value derived from where the panel is served:

| Setting | Comes from | Falls back to |
| --- | --- | --- |
| `authority` | `VITE_OIDC_AUTHORITY` | `window.location.origin` |
| `client_id` | `VITE_OIDC_CLIENT_ID` | — |
| `scope` | `VITE_OIDC_SCOPE` | `openid`, which is never sent |
| `redirect_uri` | `VITE_OIDC_REDIRECT_URI` | `<origin><base path>/callback` |
| `post_logout_redirect_uri` | `VITE_OIDC_POST_LOGOUT_REDIRECT_URI` | `<origin><base path>` |

The base path is the one Vite was built with, so a panel served under a sub-path of the
authorization server derives its own URLs without being reconfigured. The authority is the server
root either way, since that is what publishes the discovery document.

The flow is authorization code with PKCE and a DPoP-bound code. The user and the tokens are kept in
`localStorage`, the DPoP key pair in IndexedDB, and silent renewal is left on.

## What the panel asks for

**The panel asks for no scope, and takes the admin client's defaults.** `VITE_OIDC_SCOPE` is unset
in [`.env`](../.env), which turns on `omitScopeWhenRequesting`: neither the sign-in redirect nor the
silent renew iframe carries a `scope` parameter, and
[RFC 6749 §3.3](https://datatracker.ietf.org/doc/html/rfc6749#section-3.3) has the server apply the
client's own `default-scopes` instead. What the console may reach is then the deployment's to
configure, and a screen added under a new scope cannot lock an operator out of the whole panel by
asking for one its client is not allowed.

**Setting `VITE_OIDC_SCOPE` requests exactly its value**, which is the escape hatch for a console
deliberately narrower than its client's defaults.

**The placeholder in the settings is never sent.** `SigninRequest.create` rejects a falsy `scope`
before it reads the flag, so `openid` stays there to satisfy it and the flag keeps it off the wire.

**A renewal never narrows what was granted.** `OidcClient.useRefreshToken` sends the scope the
stored user carries whatever the flag says, and the server refreshes on what the refresh token
holds rather than on the form field. `refreshTokenAllowedScope` is the lever if that ever stops
being true.

**The admin client's `default-scopes` must hold `openid` beside its admin scopes.** Without it the
server issues no ID token, and the panel has no `sub`, `name` or `email` to render the signed-in
operator from. [The README](../README.md#configuring-the-panel) says so where a deployment reads it.

## Signing in

A navigation is guarded by `router.beforeEach`:

1. The store is initialized on the first navigation, which loads a user already in storage.
2. A route stating `requiresAuth: false` — `/callback` and `/register` — is let through.
3. An unauthenticated navigation tries a silent renew first, and only redirects to the authorization
   server when there is nothing to renew. The route it was heading to is carried in the OIDC `state`
   as `targetUrl`.
4. A route naming `requiredScopes` the token does not carry every one of redirects to `/`.

`/callback` is a layout-less route: it exchanges the code, then replaces itself with the
`targetUrl` the state carried. A failure there is the one place a sign-in error is rendered.

`/register` is the entry point of an invitation. It takes the `invitation_token` query parameter —
or a token typed into the form — and passes it to the authorization server as an extra query
parameter on the sign-in redirect, which is what lets a new operator claim the invitation and come
back signed in.

## Presenting the token

**A request presents the token under the scheme its token response named.** `AbstractApi` asks
`useAuthStore().makeAuthorizationHeaders` for every attempt, which answers from the user
oidc-client-ts holds: a `token_type` of `DPoP` is sent as `Authorization: DPoP <token>` beside a
`DPoP` proof, and any other as a bearer token.
[RFC 9449 §7.2](https://datatracker.ietf.org/doc/html/rfc9449#section-7.2) has a bound token refused
as a bearer token, and SympAuthy refuses an unbound one under the `DPoP` scheme.

**A proof belongs to one request.** `UserManager.dpopProof` signs it with the key the token is bound
to, naming the method, the URL and the token's hash, and the server accepts it within a minute of
its `iat` — so the retry after a renewal mints its own.

**A proof names the server's URL, not the one the request went to.** Its `htu` is the authority
joined to the path, because the server compares it with its own configured root whatever host the
request arrived on. A panel the server serves has one origin for both; under `npm run dev` the
request goes to the proxy, and the authority is what still names the server.

## Staying signed in

**A request carries the token, and nothing else renews it.**

**A 401 is answered by one silent renew and one retry.** When the renewal fails the call resolves to
an `api.unauthorized` error rather than throwing, so the screen that made it shows a message.
[The API standard](api-standard.md) owns that contract.

**A session lost outside a request is caught by `App.vue`**, which watches the store and redirects
to the authorization server when an authenticated user becomes an anonymous one — a renewal that
failed in the background, or a sign-out elsewhere.

**Signing out is a redirect to the server's end-session endpoint.** The sidebar calls
`authStore.signout()`, and the server decides where the operator lands.

## What the token granted

The store exposes the profile the server issued: `userName`, `userEmail` and `grantedScopes`.

**`grantedScopes` is what the server granted, not what the panel asked for.** It is `User.scopes`,
the parsed `scope` of the token response, which SympAuthy fills from the access token's own granted
scopes — and admin scopes reach an operator through the scope granting rules, so the set can be
narrower than the client's defaults.

**A revoked scope stops opening its pages within one token lifetime**, because SympAuthy answers
every refresh with the `scope` it granted and `automaticSilentRenew` re-reads it. The mechanism is
the server's, not the library's: oidc-client-ts carries the previous set forward where a token
response omits `scope`, so a server that stopped answering with it would leave a session opening
what it no longer holds.

**A screen names the scopes it needs once, as `requiredScopes` on its route.**
[The route table](../src/app/router/index.ts) is what each of them requires, and a route under
another states the whole set rather than the difference, since a child's `meta` replaces its
parent's key.

**Three readers answer from that one declaration.** The guard refuses a route whose scopes are not
all granted; a record's tab strip drops the tab; the sidebar draws an entry the token cannot open
disabled, naming the scopes it lacks. The guard and the tab strip answer through `canOpenRoute`,
which `useRouteAccess` binds to the router of the component calling it — and which answers `false`
for a route the router does not know, so a navigation naming a renamed route loses its entry rather
than throwing out of the render that drew it. The sidebar asks `missingScopes` of the same
`requiredScopes`, since it has to say which are missing rather than whether one is; its entries are
the panel's own index, so none of them names a route the router does not know.

**`/` is the panel's root and its no-access page at once.** The guard sends it on to the first entry
of [the navigation](../src/app/router/navigation.ts) the token can open, and `NoAccessPage` renders
only when that is none of them — naming the scopes the console reads, off the routes themselves, so
the operator reading it knows what to ask for.

**A control the token does not cover is drawn disabled, never hidden.** That holds for an entry of
the sidebar, an item of a record's `ActionsDropdown` and a button alike: the operator sees what the
panel offers and what their token keeps them from, and a screen does not change shape with the
scopes they were granted. The disabled control names the scopes it is missing, so the operator
knows what to ask for — under its label in a menu, and in a `HintTooltip` on a button or a sidebar
entry.

**An action names the scopes its call is made under, as `requiredScopes`** — on its `ActionItem` in
a menu, and on its `CommonButton` outside one. It is the action's counterpart of a route's
`requiredScopes`, read from the server's `@Secured` on the endpoint, and the shared component is
what disables it: a page states the scopes and never decides the state itself. A force logout is a
revocation of grants, so it names `admin:grants:write` wherever it is offered.

## What this document does not cover

**A record's tab.** The tab strip still drops a tab the token cannot open rather than drawing it
disabled: it lists the views of one record rather than offering a choice, and whether it joins the
rule above is open.

**Why a scope is missing.** Whether the admin client is not allowed it or the granting rules did not
grant it is not in the token, and the panel does not guess.

**DPoP nonces.** The server hands none out and never answers `use_dpop_nonce`, so a proof carries
none and a refusal asking for one is not retried.

**The interactive flow itself.** It is served by the authorization server and rendered by the
[flow application](https://github.com/sympauthy/sympauthy-flow); the panel only leaves and returns.

---

← [Design documentation](index.md)
