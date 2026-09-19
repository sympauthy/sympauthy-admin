# Running locally

## Setting up

The Node version is pinned in [`.nvmrc`](../.nvmrc). Select it before any `npm` or `node` command:

```sh
nvm use
npm install
```

## Running

```sh
npm run dev
```

The dev server listens on `http://localhost:5174` and proxies `/api` and `/.well-known` to
`http://localhost:8080`, so it needs a SympAuthy running there — see the server's own
[running locally](https://github.com/sympauthy/sympauthy/blob/main/docs/running-locally.md).
Start it with the `admin` environment enabled, which is what registers the `admin` client the panel
signs in as.

Because the API is proxied onto the same origin, the panel runs against a real server with no CORS
configuration of its own.

## Signing in the first time

The `admin` environment ships a bootstrap invitation for the first operator, whose token the server
prints with a URL pointing at its own `/admin/register`. In development the panel is on another
port: open `http://localhost:5174/register` and paste the token there, which sends it to the
authorization server as part of the sign-in redirect.

## Configuration

[`.env`](../.env) holds what every developer needs: the OIDC client id and the scopes the panel asks
for. Anything machine-specific goes in `.env.local`, which is not committed:

```sh
VITE_OIDC_AUTHORITY=http://localhost:8080
VITE_OIDC_REDIRECT_URI=http://localhost:5174/callback
VITE_OIDC_POST_LOGOUT_REDIRECT_URI=http://localhost:5174
```

Without them the panel derives its URLs from `window.location.origin`, which is right in production
and wrong in development, where the authorization server is on another port.
[Authentication](authentication.md) has the full list.

## Checking a change

```sh
npm run type-check    # vue-tsc over the sources and the templates
npm run lint          # ESLint, with --fix
npm run lint:arch     # Steiger: the Feature-Sliced Design rules
npm run format        # Prettier, writing
npm run build         # the type-check and the production build, in parallel
```

CI runs ESLint, Steiger, `prettier --check` and the build on every push to `main` and every pull
request targeting it, so a formatting run that was skipped fails the pull request rather than the
review. A feature branch gets no CI of its own until a pull request is opened.

There is no test framework: nothing in the repository runs a test, and a change is checked by the
commands above and by running it.

---

← [Design documentation](index.md)
