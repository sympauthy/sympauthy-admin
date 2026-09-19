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

**A fetch method is named `fetch…` and takes the identifiers it needs**, and resolves to `void`. A
collection's own paging is the collection's, so a `fetch…` over one takes the parent's identifier
and nothing else.

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

**A page never builds a query parameter.** It calls a method the store exposes, or one of the
collection the store holds.

## A collection

**A store holding a paged collection exposes one `useCollection` under the plural of what it
holds.** `useUserStore` returns `{ users }`, and everything a page is wired to — the rows, the
paging, the criteria, the capability document — is on it.
[The collection standard](collection-standard.md#a-store-holds-a-collection) owns the rest.

**A store holding a collection and something else names each.** `clients` is the collection the page
lists; `allClients` is every client there is, for a picker — one is not the other, and a dialog
filling the second must not replace what the first is displaying.

## A detail store

**A detail store exposes `$reset()`, and the page calls it in `onMounted` before fetching.** Every
ref goes back to its initial value, so a second record never renders under the first one's data.

**A second concern is a second store, not a prefix.** A user's detail, their claims, their second
factors, their linked providers and their consents are five stores, each owning its own `loading`,
`error` and page — which is what a `…Loading` prefix used to stand in for.

## Mutating

**A mutation refetches what it changed, at the page currently displayed.**

**A mutation records its own failure in the `error` of what it changed**, except where the caller
needs the message beside a field.

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
