---
description: What a Pinia store holds now that a screen holds its own collection, how it fetches
  and reports failure, and the contract a detail store answers.
paths:
  - "src/**/model/use*.ts"
  - "src/shared/auth/use*.ts"
---

# Store standard

A store holds what more than one screen reads, so a panel and the dialog acting on it read the same
state. It calls [an API client](api-standard.md) and exposes the result; it renders nothing and
knows nothing about the route.

**A store lives in `entities/` only where more than one slice reads it.** `allClients` is one
because a dialog in `features/logout-user` and two under `pages/user-detail` offer the same list;
an account's own record is not, because only the shell above its tabs reads it.

**What one slice reads, that slice holds** — in the component that reads it, or in the slice's own
`model/` where more than one component of it does. A collection is the case that recurs: the page
an operator is on and the filters they typed belong to the screen showing them, and [the collection
standard](collection-standard.md#a-page-holds-a-collection) owns what it does with them.

**A store that stops being read by a second slice goes back where it is read**, and one read by a
second slice moves up. The file is the same either way: `use…Store.ts` in a `model/` segment.

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
collection it holds.

## A complete list

**Every record of a collection, for a picker several slices open, is a store's.** `allClients`: a
dialog offering all of them is not the screen listing a page of them, and what the dialog reads
must not replace what the list behind it is displaying. A picker one slice opens is that slice's,
read where it is offered.

**It is named for the whole set**, `all…`, beside the `…Loading` and `…Error` it carries — a store
holding one names what it is, because the collection it is not is elsewhere.

## A detail store

**A detail store exposes `$reset()`, and the page calls it in `onMounted` before fetching.** Every
ref goes back to its initial value, so a second record never renders under the first one's data.

**A second concern is a second store, not a prefix.** Each owns its own `loading` and `error`,
which is what a `…Loading` prefix used to stand in for, and a panel then waits on its own request
rather than on another panel's.

## Mutating

**A mutation refetches what it changed, at the page currently displayed.** One over the rows a
screen lists is that screen's, beside the collection it refetches.

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

**Invalidating another screen.** An action refetches what it changed where it changed it, and a
screen showing the same records elsewhere keeps what it last read.

**Subscriptions and plugins.** No store is subscribed to, and Pinia runs with none.

---

← [Design documentation](index.md)
