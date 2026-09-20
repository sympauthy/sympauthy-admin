# SympAuthy Admin

The operator's panel of [SympAuthy](https://github.com/sympauthy/sympauthy), an open-source,
self-hosted OAuth2 and OpenID Connect authorization server. It inspects the accounts, clients,
claims, scopes, audiences, invitations and interactive flow sessions the server owns, and performs
the actions an operator takes on them.

Vue 3 and Vite, built into static assets the authorization server serves itself.

## Using SympAuthy Admin

The panel ships with the server. How to configure and run one is the
[public documentation](https://sympauthy.github.io).

## Configuring the panel

The panel is built by Vite, so its configuration is the `VITE_OIDC_*` variables baked into the build
— [`.env`](.env) for what every deployment shares, `.env.local` for what one machine needs.

| Variable | What it sets | Unset |
| --- | --- | --- |
| `VITE_OIDC_CLIENT_ID` | the admin client the panel signs in as | required |
| `VITE_OIDC_AUTHORITY` | the authorization server root | the origin the panel is served from |
| `VITE_OIDC_SCOPE` | the scopes the panel requests | requests none, and takes the client's `default-scopes` |
| `VITE_OIDC_REDIRECT_URI` | where the sign-in comes back to | `<origin><base path>/callback` |
| `VITE_OIDC_POST_LOGOUT_REDIRECT_URI` | where a sign-out lands | `<origin><base path>` |

**The admin client's `default-scopes` are what the console can reach.** With `VITE_OIDC_SCOPE`
unset the panel requests no scope at all, so the server applies that list — which must hold
`openid` beside the admin scopes the panel is meant to read, or no ID token is issued and the panel
cannot render the signed-in operator. An operator whose granted scopes are narrower still sees only
the pages those scopes open.

## Working on SympAuthy Admin

**[`docs/`](docs/index.md) is the authority on how this panel is built** — the architecture, the
standards every layer holds to, and the decisions behind them. Read the document governing a change
before the code it governs.

To set the project up and run it, see [Running locally](docs/running-locally.md).

The recommended IDE setup is [VS Code](https://code.visualstudio.com/) with
[Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar), Vetur disabled.
