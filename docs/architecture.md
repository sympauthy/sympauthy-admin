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
reserves the segment names, so a segment holding components keeps them beside its model rather than
under a `ui/` of its own. They are `shared/api`, `shared/auth`, `shared/collection`, `shared/i18n`,
`shared/lib` and `shared/ui`.

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

## A named segment in `shared/`

FSD divides `shared/` by technical purpose — `api`, `ui`, `lib`, `i18n` — because a segment named
after a concern is how business logic gets in. `auth` and `collection` are named after what they
hold instead, and that is deliberate: each holds one contract of the authorization server rather
than one of its nouns. `collection` is the paging and filtering grammar the admin API answers in,
entity-free by construction — its state is a `Collection<unknown>`, and the fields it filters on are
read from [the capability document](collection-standard.md#the-capability-document) at runtime, so
no build of this panel knows them.

**A segment is named after what it holds only where no domain vocabulary reaches it, and where what
it holds is a contract rather than a noun.** A component that is such a segment's own surface lives
in it rather than in `shared/ui`: `CollectionPage` is not a piece of the kit a screen reaches for,
it is what the segment is used through.

FSD's `widgets/` layer is the other place that block could live, and it is not taken. That layer
composes entities and features, and `CollectionPage` composes neither. `useCollection` could not
follow it up there in any case: every entity store owns its collection, so that a mutation can
refetch it at the page displayed and the dialog acting on a record reads the same rows the list
does. The block would end up split across a layer boundary rather than held in one folder.

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
