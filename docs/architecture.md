# Architecture

SympAuthy Admin is a single page application. It is built by Vite into static assets the
authorization server serves, and it holds nothing of its own: every screen is a call to the server's
`/api/v1/admin` surface, authenticated with an access token the panel obtains as a public OIDC
client. [Authentication](authentication.md) covers how it gets that token, and
[Technology](technology.md) why each framework was picked.

## Feature-Sliced Design

The source follows [Feature-Sliced Design](https://feature-sliced.design). `npm run lint:arch` runs
[Steiger](https://github.com/feature-sliced/steiger) over `src/`, CI fails on a violation, so the
structure is checked rather than agreed.

A layer imports from the layers strictly below it, and never sideways or upward.

| Layer | Holds |
| --- | --- |
| `app/` | `App.vue`, the router, the global stylesheet, the layout shell |
| `pages/` | one slice per route: the route component and what only it uses |
| `features/` | a user action reused by more than one page |
| `entities/` | one slice per domain noun: its API client, its resources and schemas, its stores |
| `shared/` | the design system, the HTTP and collection plumbing, auth, i18n, utilities |

`src/main.ts` is Vite's entry point and sits outside the layers: it creates the app, the router, the
i18n instance and the Pinia instance, and mounts the result.

## Slices and segments

A slice is one folder, and its files are split into the segments it needs:

| Segment | Holds |
| --- | --- |
| `api/` | the HTTP clients that reach the authorization server |
| `model/` | resources and their schemas, the stores, and the domain helpers over them |
| `ui/` | the Vue components |

`shared/` has no slices: it is divided into segments directly, and each of them is flat — Steiger
reserves the segment names, so nothing inside a segment is called `ui/` or `model/`. They are
`shared/api`, `shared/auth`, `shared/i18n`, `shared/lib` and `shared/ui`.

The slices that exist are the folders under each layer. Today the entities are the nouns the admin
API publishes — `user`, `client`, `claim`, `scope`, `audience`, `consent`, `invitation`, `session` —
`features/` holds `logout-user`, and `pages/` holds one slice per route in
[the router](../src/app/router/index.ts).

## The public API of a slice

Every slice, and every `shared/` segment, has an `index.ts`, and that file is the only entry point
another slice may import from:

```ts
import { useUserStore } from '@/entities/user'   // yes
import { useUserStore } from '@/entities/user/model/useUserStore'   // no
```

Inside a slice, files import each other by relative path (`./UserSummaryPanel.vue`). A page
publishes only its route component; its panels and dialogs stay internal.

## Cross-imports

Slices on the same layer may not import each other. The exception is an entity that genuinely nests
another, handled through FSD's `@x` notation: an interactive flow session embeds the user it
authenticates, so `entities/user/@x/session.ts` publishes exactly what the `session` slice may use,
and nothing else reaches across.

## Where a new file goes

1. **No domain vocabulary in `shared/`.** If the props mention a user, a client or a scope, it is
   not shared.
2. **Used by one page → that page's slice.** It moves to `features/` when a second page needs it.
   `LogoutDialog` earned its place there by being used by both the users list and the user detail
   page.
3. **Displays or fetches one entity → that entity's slice.** An API client, its schemas and the
   store that consumes them always travel together.
4. **`shared/auth` stays in `shared/`,** not in `entities/`: `AbstractApi` depends on
   `useAuthStore`, and `shared` may not import upward.

## The one disabled rule

`fsd/insignificant-slice` is off for `src/entities/**`, in
[`steiger.config.ts`](../steiger.config.ts). An entity slice owning an API client, its schemas and
a store is correct even when a single page
reads it today; folding it into that page would put HTTP and model code inside a route folder. The
rule stays on for pages and features, where it does catch a premature slice.

## The collection block

Every list screen is built from the same block: the state one collection is read with, the criteria
a caller builds against it, and the toolbar, the chips and the table that draw them. It is
[`features/browse-collection`](../src/features/browse-collection) — an action reused by more than
one page, which is what `features/` is for, and a layer a page may reach and an entity may not.

What an entity does need sits below it in `shared/api`: the parameters a list call takes, the
capability document with its schema, the closed sets of operators and field types that document is
written in, and `fetchAllPages`. That is the wire the server answers on and every entity's client
speaks, and it is the line [the collection standard](collection-standard.md) already drew — the
server owns the grammar, the panel owns what it makes of it.

A collection is held by the screen listing it rather than by a store, which is what lets it be a
feature at all: an entity store calling `useCollection` would be importing the layer above it. It
is also why two screens over the same records no longer share a page number.

## On disk

```
index.html               the document Vite builds around
src/main.ts              the entry point: app, router, i18n, Pinia
src/app/                 App.vue, router, layout shell, global stylesheet
src/pages/<route>/       one slice per route
src/features/<action>/   an action reused by more than one page
src/entities/<noun>/     api/, model/, ui/ for one domain noun
src/shared/              api, auth, collection, i18n, lib, ui
```

Everything outside `src/` configures the build or the tooling: `vite.config.ts` (the dev server, its
proxy and the `@` alias onto `src/`), `steiger.config.ts`, `eslint.config.js`, `.prettierrc.json`,
the TypeScript project files, and the workflows under `.github/`.

---

← [Design documentation](index.md)
