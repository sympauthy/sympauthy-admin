# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Always run `nvm use` before any npm/node command.

- **Dev server:** `npm run dev` (port 5174, proxies `/api` and `/.well-known` to `localhost:8080`)
- **Build:** `npm run build` (type-check + production build)
- **Type-check:** `npm run type-check` (vue-tsc)
- **Lint:** `npm run lint` (ESLint with auto-fix)
- **Architecture lint:** `npm run lint:arch` (Steiger — enforces the layer rules below)
- **Format:** `npm run format` (Prettier)

No test framework is configured.

## Architecture

Vue 3 (Composition API, `<script setup>`) admin panel for a Sympauthy OAuth/OIDC server.

**Stack:** Vite 7 · Vue Router 5 · Pinia 3 · Tailwind CSS 4 · reka-ui (headless UI primitives) · vue-i18n · oidc-client-ts · vee-validate + yup

The codebase follows [Feature-Sliced Design](https://feature-sliced.design). `npm run lint:arch`
(Steiger) enforces it, and CI fails on a violation — so the rules below are checked, not aspirational.

**Layers** (`src/`), each importing only from layers strictly below it:

| Layer | Holds |
| --- | --- |
| `app/` | `App.vue`, router, global styles, the layout shell (`AdminLayout`, `SidebarNav`, `BreadcrumbNav`) |
| `pages/` | One slice per route. The page component plus anything only that page uses |
| `features/` | A user action reused by more than one page |
| `entities/` | One slice per domain noun: its API client, resources + AJV schemas, and Pinia stores |
| `shared/` | Design system, HTTP plumbing, auth, i18n, utils — no domain knowledge |

`src/main.ts` is the Vite entry point and sits outside the layers.

**Slices and segments.** Each slice is one folder, split into `api/` (HTTP clients), `model/`
(resources, schemas, stores) and `ui/` (components). Present slices: `entities/{user, client, claim,
scope, audience, consent, invitation, session}` and `features/logout-user`.

**Where does a new file go?**

1. **No domain vocabulary in `shared/`.** If the props mention a user, client or scope, it isn't shared.
2. **Used by one page → that page's slice.** Promote it to `features/` only when a second page needs it.
   `LogoutDialog` earned its place there by being used by both the users list and the user detail page.
3. **Displays or fetches one entity → that entity's slice.** An API client, its AJV schemas and the
   store that consumes them always travel together.
4. **`shared/auth` stays in `shared/`,** not `entities/` — `AbstractApi` depends on `useAuthStore`,
   and `shared` may not import upward.

**Public API.** Every slice and `shared/` segment has an `index.ts`, and that is the only entry point
other slices may use: `import { useUserStore } from '@/entities/user'`, never
`'@/entities/user/model/useUserStore'`. Inside a slice, import files directly by relative path
(`./UserClaimsPanel.vue`). A page publishes only its route component; its panels stay internal.

**Cross-imports.** Slices on the same layer may not import each other. The one exception is an
interactive flow session embedding the user it authenticates, handled through FSD's `@x` notation:
`entities/user/@x/session.ts` publishes exactly what the session slice may use. Add another only
when two entities genuinely nest.

**One disabled rule.** `fsd/insignificant-slice` is off for `src/entities/**` (see `steiger.config.ts`):
an entity slice owning an API client, schemas and a store is correct even when a single page reads it
today. The rule stays on for pages and features, where it does catch premature slicing.

## API Pattern

API classes extend `AbstractApi` which provides `get<T>()`, `post<T>()`, `put<T>()`, `delete()`. It handles:
- Bearer token from `useAuthStore.accessToken`
- AJV schema validation of responses
- 401 → silent token renewal → retry
- Error responses mapped to i18n keys via `ErrorApiResponse`

Responses are `SuccessApiResponse<T> | ErrorApiResponse`, checked with `isSuccess(response)`.

## Auth Flow

1. Route guards (`requiresAuth` meta) trigger silent renew or redirect to OIDC login
2. Callback handled by `CallbackPage` → extracts user → redirects to original route
3. Tokens auto-renew; 401 API responses trigger renewal with retry

## UI Conventions

- Use `@heroicons/vue/20/solid` (not outline variants)
- Button styles defined in `src/shared/ui/ButtonStyle.ts` (primary/secondary/danger)
- `PaginatedTable` for data tables (slot-based: `header`, `rows`, `empty`)
- `ConfirmDialog` for destructive action confirmation
- `Tag` component for status badges
- In data tables, the primary/ID column uses `font-medium text-gray-900` for bold styling (not `Tag`)

### List Pages

List pages (e.g. `/users`, `/clients`) are built with `ListPage`, which is the page root — nothing
wraps it, so it can fill the height of the layout. It holds the toolbar (search bar, filters, `#actions`
slot) above a `PaginatedTable` filling the remaining height, and forwards the table slots (`header`,
`rows`, `empty`).

- **No page scrolling**: rows scroll inside the table, under a pinned header row and above a pinned
  pagination bar. The number of items per page is derived from the height available
  (`useAutoPageSize`) and re-derived when the viewport is resized.
- **Store wiring**: `@page-change` → `fetchXxx`, `@page-size-change` → `setSize`. Every list store
  exposes `size` and `setSize`, and refetches on a size change only once a first response arrived
  (the initial size is emitted before the page requests its first batch).
- **Search**: only set `searchable` on resources whose list endpoint supports a free text query
  (today, users and sessions).
- `PaginatedTable` keeps its plain flow layout by default (`fill` is opt-in), which is what detail
  page panels use.

### Overlays & interactive primitives (reka-ui)

Interactive/overlay components wrap [reka-ui](https://reka-ui.com) headless primitives: reka-ui supplies the behavior (focus trap, keyboard nav, ARIA roles, scroll lock, floating-ui positioning) while all styling stays custom Tailwind. Do **not** hand-roll click-outside / Escape / focus-management logic — reach for the matching reka-ui primitive instead.

- **Dialogs:** `BaseDialog` is the shared shell (reka-ui `Dialog*`) — overlay, centered card, `h3` title (via `title` prop or `#title` slot), fade animation, and a `dismissDisabled` prop that blocks Esc/outside-click while a request is in flight. It's controlled via `:open` + `@close`; reka-ui only emits `close` on a user dismissal, never when the parent flips `open`, so no spurious close fires after a programmatic close.
  - `ConfirmDialog` (confirm/cancel footer, `@confirm`/`@cancel`) and the form dialogs (`CreateInvitationDialog`, `EnrollMfaDialog`, `LinkProviderDialog`) all build on `BaseDialog`. New dialogs should too.
- **Dropdown menus:** `ActionsDropdown` (action list, `@action`) and `DropdownButton` (option list, `@select`) wrap reka-ui `DropdownMenu`. Style highlighted items with `data-[highlighted]:` classes (covers both hover and keyboard focus).
- **Popovers:** `HelpTooltip` wraps reka-ui `Popover` (click-triggered, collision-aware positioning).
- **Pagination:** `PaginatedTable`'s footer wraps reka-ui `Pagination*` — numbered pages with ellipsis
  from `sm:` up, previous/next at every width, and the page indicator replacing the numbers on
  phones. The current page is styled with `data-[selected]:`. reka-ui derives the page count from
  `size` + `total`, so pass both (a caller with only `totalPages` still works, one item per page).

### Detail Pages

Detail pages (e.g. `/users/:userId`, `/clients/:clientId`) follow a consistent layout:

- **Route:** `/:resource/:id`, breadcrumb parent is the list route
- **Page component** in `src/pages/<resource>-detail/ui/` — handles loading/error/content states, resets store on mount
- **Summary panel** (top): card wrapper (`bg-white rounded-lg border border-gray-200 p-4 sm:p-6`), grid of key-value pairs, no section heading. Use `CopyToClipboard` on the primary ID field.
- **Content sections**: use `DetailSection` component (`h2 / text-lg / font-semibold` heading + default slot). Optional `#help` slot for `HelpTooltip`.
  - **Tabular data** (e.g. user claims, consents): `PaginatedTable` directly inside the slot — no card wrapper (the table provides its own styling)
  - **Key-value data** (e.g. client scopes, authorization config): definition list inside a card (`<dl class="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">`), each row is `<div class="px-4 py-3 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4">` with `<dt>` label (left, `text-xs font-medium text-gray-500 uppercase tracking-wider` — same style as summary panel labels) and `<dd>` value (right)
  - **Simple lists** (e.g. redirect URIs): card wrapper with items listed inside
- **Dedicated store** per detail page (e.g. `useClientDetailStore`) with `$reset()` method

## Responsive Design

Mobile-first approach using Tailwind's default breakpoints:
- **Base (< 640px)** — Phones: sidebar is a slide-over drawer toggled by hamburger menu, tables scroll horizontally, filters and pagination stack vertically
- **`sm:` (≥ 640px)** — Large phones / small tablets: filters and pagination go side-by-side
- **`lg:` (≥ 1024px)** — Desktops: sidebar is permanently visible, full padding (`p-6`, `px-6`)

Key patterns:
- Sidebar state managed by `useSidebar` composable (shared `ref`, auto-closes on navigation)
- `AdminLayout` handles the drawer overlay and mobile header bar (`lg:hidden`)
- `SidebarNav` sizing is controlled by its parent (`h-full w-full`), not by the component itself
- Table cell padding is reduced on phones via a global CSS rule in `src/app/styles/style.css` (avoids per-page changes)
- `PaginatedTable` defaults to `table-layout="auto"` — do not use `fixed`
- Table column sizing convention:
  - **Shrink-wrap columns** (status, dates, actions): use `w-0 whitespace-nowrap` on `<th>` so they take only the space their content needs
  - **Fill columns** (names, emails, values): no width classes — they expand to fill remaining space. Add `truncate` on `<td>` to ellipsize overflow
  - **Hidden on phone**: use `hidden sm:table-cell` on both `<th>` and `<td>` (e.g. "Created At" in users list)
  - Never use fixed percentage widths (`w-[10%]`, `w-[100px]`) — they break at different breakpoints

## Environment

OIDC config via `VITE_OIDC_*` env vars (see `.env.local`). Dev proxy forwards `/api` and `/.well-known` to the backend.

## Documentation

- **Functional documentation:** https://sympauthy.github.io/functional/
- **Contributing guidelines:** https://github.com/sympauthy/sympauthy/tree/main/docs
- **Backend repository:** https://github.com/sympauthy/sympauthy