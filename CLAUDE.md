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

## Environment

OIDC config via `VITE_OIDC_*` env vars (see `.env.local`). Dev proxy forwards `/api` and `/.well-known` to the backend.

## Documentation

- **Functional documentation:** https://sympauthy.github.io/documentation/functional/
- **Contributing guidelines:** https://sympauthy.github.io/documentation/contributing/
- **Backend repository:** https://github.com/sympauthy/sympauthy