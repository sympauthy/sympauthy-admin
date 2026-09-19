---
description: What a Pinia store holds, how it fetches and reports failure, and the contract a list
  store and a detail store each answer.
paths:
  - "src/**/model/use*.ts"
  - "src/shared/auth/use*.ts"
---

# Store standard

A store holds what a screen displays, so a panel and the dialog acting on it read the same state.
It calls [an API client](api-standard.md) and exposes the result; it renders nothing and knows
nothing about the route.

## Shape

**A store is a setup store, in a file named after it.** `defineStore('<id>', () => { … })` in
`use…Store.ts`, in the `model/` segment of the slice whose resources it holds.

**The identifier is the resource in the plural for a list, and the concern in camelCase for
anything else.** `users`, `clients`, `userDetail`, `userMfa`, `auth`.

**A store constructs the API client it needs.** `const api = new UserApi()`, at the top of the
setup.

**State is a `ref`, and anything derivable is a `computed`.** `totalPages` is computed from `total`
and `size`, never assigned.

**A store returns an explicit object naming everything it exposes**, closing the setup. What is not
in it is private.

**A second concern over the same entity is a second store.** A user's detail, their enrolled second
factors, their linked providers and their consents are four, each owning its own `loading`, `error`
and page — growing one store to cover all four is what makes a panel wait on another panel's
request.

## Fetching

**A fetch method is named `fetch…`, takes the identifiers it needs and the page to request**, and
resolves to `void`.

**It raises `loading`, clears `error`, and lowers `loading` at the end whatever happened.**

**On success it assigns the content; on failure it fills `error` from `getErrorMessage` and empties
the collection.** A stale row under a failure message is worse than an empty table.

```ts
const response = await api.listUsers(params)
if (isSuccess(response)) {
  users.value = response.content.users
  page.value = response.content.page
  total.value = response.content.total
} else {
  error.value = getErrorMessage(response)
  users.value = []
}
```

**A filter, a search term and a sort live in the store, and their setter refetches from the first
page.** `setStatusFilter`, `clearClaimFilter`, `toggleSort` — the page calls one and reads the
result, and never builds query parameters itself.

## A list store

**A list store exposes `page`, `size`, `total`, `totalPages`, `loading`, `error`, its collection, a
`fetch…` and a `setSize`.** [The list page](page-layout-standard.md#list-pages) is wired to exactly
those.

**`setSize` ignores a size below one or unchanged, and requests the page holding the first row
currently displayed.** Resizing the viewport then keeps the operator roughly where they were.

**`setSize` refetches only once a first response has arrived.** A `loaded` flag guards it, because
the initial size is emitted before the page has requested anything and would otherwise fetch twice.

## A detail store

**A detail store exposes `$reset()`, and the page calls it in `onMounted` before fetching.** Every
ref goes back to its initial value, so a second record never renders under the first one's data.

**A store holding more than one collection prefixes each one's state.** `claims`, `claimsLoading`,
`claimsError`, `claimsPage` — a shared `loading` would make one panel's request blank another's.

## Mutating

**A mutation refetches what it changed, at the page currently displayed.**

**A mutation records its own failure in the store's `error`**, except where the caller needs the
message beside a field.

**A mutation returns what its caller has to act on, and nothing more**: `void` where the refetched
state is the whole answer, a boolean where a dialog closes on success, the response itself where the
body matters — an invitation's token is shown once and never fetched again.

## Boundaries

**A store never reads the route, renders, or formats for display.** The page passes the identifiers
in; a component asks `formatDate` for the string it draws.

**A store never renews a token, retries or reads a status code.**
[`AbstractApi`](api-standard.md#what-a-call-resolves-to) owns all three.

**A component never writes into a store's state.** It calls a method the store exposes.

## What this standard does not cover

**Persistence and hydration.** Nothing survives a reload except what `shared/auth` keeps for the
OIDC client.

**Invalidating another store.** An action refetches its own collection, and a screen showing the
same record elsewhere keeps what it last read.

**Subscriptions and plugins.** No store is subscribed to, and Pinia runs with none.

---

← [Design documentation](index.md)
