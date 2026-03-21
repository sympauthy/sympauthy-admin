# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Always run `nvm use` before any npm/node command.

- **Dev server:** `npm run dev` (port 5174, proxies `/api` and `/.well-known` to `localhost:8080`)
- **Build:** `npm run build` (type-check + production build)
- **Type-check:** `npm run type-check` (vue-tsc)
- **Lint:** `npm run lint` (ESLint with auto-fix)
- **Format:** `npm run format` (Prettier)

No test framework is configured.

## Architecture

Vue 3 (Composition API, `<script setup>`) admin panel for a Sympauthy OAuth/OIDC server.

**Stack:** Vite 7 · Vue Router 5 · Pinia 3 · Tailwind CSS 4 · vue-i18n · oidc-client-ts · vee-validate + yup

**Key directories:**
- `src/pages/` — Page-level components (routed views)
- `src/components/` — Reusable UI components (no external UI library — all custom with Tailwind)
- `src/stores/` — Pinia composition-style stores (handle API calls + reactive state)
- `src/client/` — HTTP layer: `AbstractApi` base class, per-resource API classes, model interfaces + AJV schemas
- `src/auth/` — OIDC `AuthService` wrapper around `oidc-client-ts` UserManager
- `src/composables/` — Vue composables
- `src/locales/` — i18n JSON translation files

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
- Button styles defined in `src/styles/ButtonStyle.ts` (primary/secondary/danger)
- `PaginatedTable` for data tables (slot-based: `header`, `rows`, `empty`)
- `ConfirmDialog` for destructive action confirmation
- `Tag` component for status badges
- In data tables, the primary/ID column uses `font-medium text-gray-900` for bold styling (not `Tag`)

## Responsive Design

Mobile-first approach using Tailwind's default breakpoints:
- **Base (< 640px)** — Phones: sidebar is a slide-over drawer toggled by hamburger menu, tables scroll horizontally, filters and pagination stack vertically
- **`sm:` (≥ 640px)** — Large phones / small tablets: filters and pagination go side-by-side
- **`lg:` (≥ 1024px)** — Desktops: sidebar is permanently visible, full padding (`p-6`, `px-6`)

Key patterns:
- Sidebar state managed by `useSidebar` composable (shared `ref`, auto-closes on navigation)
- `AdminLayout` handles the drawer overlay and mobile header bar (`lg:hidden`)
- `SidebarNav` sizing is controlled by its parent (`h-full w-full`), not by the component itself
- Table cell padding is reduced on phones via a global CSS rule in `style.css` (avoids per-page changes)
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
- **Contributing guidelines:** https://sympauthy.github.io/contributing/
- **Backend repository:** https://github.com/sympauthy/sympauthy