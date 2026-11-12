# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## What this is

SympAuthy Admin is the operator's panel of a [SympAuthy](https://github.com/sympauthy/sympauthy)
authorization server: it inspects the accounts, clients, claims, scopes, audiences, invitations,
grants and interactive flow sessions the server owns, and performs the few actions an operator takes
on them.
Vue 3 with `<script setup>`, Vite, Pinia, Vue Router, Tailwind and reka-ui, built into static assets
the authorization server serves itself. It stores nothing but each operator's preferences: every
screen is a call to `/api/v1/admin`, authenticated as an ordinary public OIDC client of that same
server, and the preferences are kept on the operator's account through `/api/v1/user/claims`.

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
npm run dev          # port 5174, proxies /api, /.well-known and /branding to localhost:8080
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

**A phone width is checked in a 390px frame, not by resizing the browser**, which will not shrink a
window that narrow. Serve a page of iframes from the scratchpad on another port of `localhost` —
never `127.0.0.1`, a different site, which loses the signed-in session — and open it:

```sh
cat > index.html <<'EOF'
<!doctype html><body style="margin:0;display:flex;gap:12px;background:#ddd">
<iframe src="http://localhost:5174/clients" width="390" height="680"></iframe>
<iframe src="http://localhost:5174/clients/admin" width="390" height="680"></iframe>
</body>
EOF
python3 -I -m http.server 8765 --bind 127.0.0.1   # then open http://localhost:8765/
```

One frame per screen to compare, side by side; stop the server when done.

## Issues

**A new issue opens in the earliest open milestone**, unless the user names another. That milestone
is the next release; read the list rather than assuming which one it is, since it moves as releases
ship.

## Pull requests

**A pull request is squash-merged, and its branch deleted on both sides.** The history is therefore
one `Title (#number)` commit per change, and a merged branch never lingers.

```sh
gh pr merge <number> --squash --delete-branch   # squashes, drops the remote and local branch
git checkout main && git pull --prune           # land on a main that carries the commit
```

Return to `main` and pull even when the merge left no local branch behind: the next change starts
from the merged state, not the one the branch was cut from.

## Architecture — `docs/architecture.md`, `docs/general-code-standard.md`

The source follows [Feature-Sliced Design](https://feature-sliced.design), and Steiger enforces it:

- **`app/`** — `App.vue`, the router, the global stylesheet, the layout shell.
- **`pages/`** — one slice per route, holding the route component and what only it uses. A
  resource with a record groups its routes: `pages/users/{list,detail,claims,…}`.
- **`features/`** — an action reused by more than one page.
- **`entities/`** — one slice per domain noun more than one slice reads: its API client,
  resources, schemas and stores. A noun one route reads lives in that route's slice until a second
  reader appears; `fsd/insignificant-slice` is on, so this is checked.
- **`shared/`** — the panel's own kit, HTTP plumbing and the collection wire, auth, i18n, utilities.
  No domain knowledge.

A layer imports only from the layers below it, a slice only through another slice's `index.ts`, and
two slices on the same layer never import each other — except through an `@x/` cross-import, which
`entities/user` publishes to `entities/session` and `entities/grant`.

`src/main.ts` sits outside the layers: it reads the deployment's brand, then mounts the app, the
router, the i18n instance and Pinia.
