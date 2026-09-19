# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## What this is

SympAuthy Admin is the operator's panel of a [SympAuthy](https://github.com/sympauthy/sympauthy)
authorization server: it inspects the accounts, clients, claims, scopes, audiences, invitations and
interactive flow sessions the server owns, and performs the few actions an operator takes on them.
Vue 3 with `<script setup>`, Vite, Pinia, Vue Router, Tailwind and reka-ui, built into static assets
the authorization server serves itself. It stores nothing: every screen is a call to
`/api/v1/admin`, authenticated as an ordinary public OIDC client of that same server.

**`docs/` is the authority** (start at `docs/index.md`). Read the document governing a change before
the code it governs, and put a new design decision there before or alongside its code. The standards
are symlinked into `.claude/rules/`, each loaded when a file it governs is read, so a rule one of
them states is not restated here — it would be a second copy, and the copy that drifts.

**Rules, not inventory.** What exists is answered by `src/`, `git log` and `docs/`. What belongs
here is what no symlinked standard carries: how the project is run, and the shape of the system the
descriptions in `docs/` hold. Never a status report.

**Treat an absence as a decision, not an oversight.** Every standard ends with what it deliberately
does not cover. If you end a deferral, say there why.

## Commands

Always run `nvm use` before any `npm` or `node` command.

```sh
npm run dev          # port 5174, proxies /api and /.well-known to localhost:8080
npm run type-check   # vue-tsc over the sources and the templates
npm run lint         # ESLint, with --fix
npm run lint:arch    # Steiger: the Feature-Sliced Design rules
npm run format       # Prettier, writing
npm run build        # the type-check and the production build, in parallel
```

CI runs ESLint, Steiger, `prettier --check` and the build on every push to `main` and every pull
request targeting it — a feature branch gets none of its own. There is no test framework: a change
is checked by those and by running it.

The dev server needs a SympAuthy on `localhost:8080`, started with the `admin` environment. Full
setup is `docs/running-locally.md`.

## Issues

**A new issue opens in the earliest open milestone**, unless the user names another. That milestone
is the next release; read the list rather than assuming which one it is, since it moves as releases
ship.

## Architecture — `docs/architecture.md`, `docs/general-code-standard.md`

The source follows [Feature-Sliced Design](https://feature-sliced.design), and Steiger enforces it:

- **`app/`** — `App.vue`, the router, the global stylesheet, the layout shell.
- **`pages/`** — one slice per route, holding the route component and what only it uses.
- **`features/`** — an action reused by more than one page.
- **`entities/`** — one slice per domain noun: its API client, resources, schemas and stores.
- **`shared/`** — design system, HTTP plumbing, auth, i18n, utilities. No domain knowledge.

A layer imports only from the layers below it, a slice only through another slice's `index.ts`, and
two slices on the same layer never import each other — except through an `@x/` cross-import, which
`entities/user` publishes to `entities/session`.

`src/main.ts` sits outside the layers and mounts the app, the router, the i18n instance and Pinia.
