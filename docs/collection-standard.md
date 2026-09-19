---
description: How the panel reads a paged collection — the document each one publishes, the criteria
  built against it, the state a store holds, and the page it is drawn as.
paths:
  - "src/shared/collection/**"
  - "src/shared/ui/Collection*.vue"
  - "src/entities/*/api/**"
  - "src/entities/*/model/use*Store.ts"
---

# Collection standard

A collection is a paged resource of the admin surface and everything the panel does with one: the
document it publishes about itself, the criteria a caller builds against that document, the state a
store holds, and the page it is drawn as. [The server's collection
standard](https://github.com/sympauthy/sympauthy/blob/main/docs/collection-standard.md) owns the
grammar; this one owns what the panel makes of it.

**The panel holds no list of filters.** Every field a collection can be narrowed by is read from
that collection at runtime, because the set is the deployment's — its claims, its clients, its
audiences, its scopes — and no build knows it.

## The capability document

**A collection publishes what it accepts at `capabilities` under its own path**, and the panel reads
it as a `CollectionCapabilitiesResource`: the fields it filters on with the operators each admits,
the fields it orders on, the fields a free text `q` matches, and its default sort.

**The document is requested beside the first page, never before it.** The first page carries no
criteria, so nothing about it waits; the toolbar appears when the document lands.

**It is requested once per collection, not once per record.** It describes the collection rather
than a row, so the one under a parent path reads the same for every parent —
[`reset()`](#a-store-holds-a-collection) keeps it.

**A read that failed is asked for again by the next page request.** There is nothing to keep, and a
transient failure must not leave a collection without a toolbar until the tab is reloaded.

**A field whose type or operators the panel does not know is dropped, and the rest still render.**
`knownCollectionFilters` decides that. A server ahead of its panel must cost the one field it added,
not the whole toolbar.

**A failed document is a warning, not a page failure.** The records still list;
`capabilitiesError` is what the toolbar says instead of the filters.

## Criteria

**A criterion is a field, an operator and a value**, and `CollectionCriteria` holds the filters, the
sort keys and the free text together.

**`collectionQueryParams` is the only thing that writes the grammar.** A bare `field=` for `eq` and
a dotted suffix for everything else, `in` comma-separated, `sort` an ordered list each descending
under a leading `-`, `q` the free text. Nothing else builds a query parameter.

**A criterion is addressed by its own id, not by its field.** A field carries as many criteria as
the caller adds, which is how a range is asked for — `created_at.gte` beside `created_at.lte`.

**An incomplete criterion is left out of the request.** A chip the caller has opened and not filled
narrows nothing, and sending it would be a `400` while they are still typing.

**A criteria change is asked of the server once it has settled**, after
`CRITERIA_DELAY_IN_MS`. Paging, sorting and resizing are each one deliberate act and are not
delayed.

**A criteria change asks for the first page.** A narrowed collection has a different first page, so
the one being read is never the one to come back to.

**Only the last request asked for is painted.** A debounced criteria change and a page click can be
in flight together, and the one that answers last is not the one the caller is waiting for.

## A store holds a collection

**A store exposes one `useCollection` per collection, under the plural of what it holds.**
`useUserStore` returns `{ users }`, and a page reads `store.users.items`.

**A collection under a parent holds that parent's identifier and reads it at call time.** The store
sets it in its `fetch…`, so paging and filtering stay on the record the page last asked for.

```ts
const userId = ref('')
const claims = useCollection<UserClaimResource, UserClaimListResource>({
  capabilities: () => api.getUserClaimCapabilities(userId.value),
  page: (params) => api.listUserClaims(userId.value, params),
  items: (content) => content.claims
})
```

**A parameter the collection reads for something other than a criterion is a `selection`.**
`/admin/users`'s `claims` picks what is published rather than what is kept, so it travels beside the
criteria and is not resolved against the document.

**`$reset()` is `<collection>.reset()`**, and a record's page calls it in `onMounted` before
fetching. It disowns a request still travelling, so the record being left cannot paint its rows, its
failure or its spinner over the one being opened.

**A mutation refetches its collection at the page displayed, and records its failure in
`<collection>.error`.**

**A complete list for a picker is its own state, never the collection's rows.** `allClients`,
`allAudiences` — a dialog walking every page into the collection replaces what the page behind it is
displaying.

**`fetchAllPages` is what walks it.** One copy of the loop, one place where a server capping the
page size below the one asked for stops it rather than re-reading the same window.

## The client

**A collection's list call takes `CollectionParams`,** and a collection reading a parameter of its
own extends it and names that one. A criterion is not a parameter anything declares: it arrives
through the index signature.

**A collection's client publishes a `get…Capabilities` beside its `list…`,** with the path written
in full as [the API standard](api-standard.md#clients) requires.

## The page

**A collection is drawn by `CollectionPage`, which is the page's root element**, and it is handed
the collection whole:

```html
<CollectionPage :collection="store.users" :search-placeholder="t('pages.users.search')">
```

**A page writes its columns and its rows, and nothing else.** The toolbar, the operators, the value
controls, the sort arrows and the query string all come from the collection.

**Every column goes through `CollectionSortHeader`.** It asks the document whether the field is
sortable and draws a plain header where it is not, so a page never decides that itself.

**A column's label is the page's own string, from `pages.<route>`.** The document names a filter and
a sort key; a column is a different question, and some columns are not fields at all.

**A header's field is the wire name the collection publishes.** A name no collection knows silently
renders an unsortable column, so it is read off the capability document rather than guessed.

**The search field appears where the collection searches on something**, and nowhere else — which
is the document's answer, not a prop.

**Every control is bound to the criteria, never left to the DOM.** A store outlives the page that
read it, so a query it still holds would otherwise narrow the collection from a field that looks
empty.

**What the page could not draw goes in the `notice` slot**, above the table. The toolbar says the
same of a capability document it failed to read.

## The filter bar

**A chip opens on the operator its field's type reads best and offers the rest the field admits.**
`contains` over text, `eq` over a word, `gte` over a number or a moment; a field narrowing its set
falls back to the first operator it lists.

**The value control is the field's type, or the values where its set is closed:**

| The field | The control |
| --- | --- |
| publishes `values` | a `select` of them, a multi-select under `in` |
| `boolean` | a yes/no `select` |
| `date`, `date_time` | a date or datetime input |
| `number` | a number input |
| `string`, `email`, `phone_number`, `uuid`, `timezone` | a text input |
| under `in` with no published values | a text input, the list typed comma-separated |
| under `is_null` | none |

**Changing a chip's operator clears its value.** `in` holds a list where the others hold one, so
carrying a value across would ask the new operator the old question.

**`is_null` is offered as *is empty* and sends `true`.** The panel does not offer its other half;
a caller wanting *carries any value* writes the query string themselves.

## Naming

**The panel names the operators and the server names everything else.** The ten words are closed and
deliberately unlocalized, so they are read from `common.operators.<operator>`; a field's name, a
value's name and every set they come from arrive in the document.

**A type whose comparisons read differently declares its own labels.**
`common.operators.date.<operator>` wins where it exists — *is on or after* rather than *is at
least*.

**A request carries `Accept-Language`, from the locale the panel renders in.** `AbstractApi` sets
it, so the language a document is named in and the language around it are the same by construction.

**No `collection.*` error code is in the bundle.** The panel builds its query from the document, so
one of those is a panel bug and the server's own sentence is what says so.

## A collection under a record

**A record's screen is a shell: its summary, a `RecordTabs` strip, and the tab's page filling what
is left.** Each tab is a route, so the view an operator is on is addressable and survives a reload.

**A record's route redirects to its first tab** and keeps its own name, so a `router.push` naming
the record still works and the URL always names a view.

**A tab exists for each of the record's collections, and one more per view the record holds that is
neither a collection nor part of the record itself.** A user's four tabs are its four collections; a
session adds its purposes to its places.

**What identifies or qualifies the record sits in the shell, not in a tab.** A session's failure
explains the status beside it, so it stays in sight whichever tab is open.

**A tab names its view and carries that view's explanation**, both read under the route it opens:
`pages.<route>.title` and the `help` triple beside it. The tab is the view's title, so the
`HelpTooltip` belongs against it rather than inside the page.

**A tab's page repeats neither.** Nothing renders a `DetailSection` titled the way the tab that
opened it already is, and nothing draws a second tooltip for what the strip above it explains.

**A shell re-reads its record only when the identifier changes.** Moving between tabs must not
refetch it.

## What this standard does not cover

**Criteria in the URL.** They live in their store and a reload clears them, tracked by
[#133](https://github.com/sympauthy/sympauthy-admin/issues/133).

**Ordering on more than one key.** The grammar takes a list and the criteria hold one; a header
names one key at a time, and nothing offers a second.

**Caching a capability document across screens.** Each collection reads its own, once per session of
that screen, and nothing revalidates.

**`or` and grouping.** The server composes criteria with `and` only, and nothing here could express
anything else.

**Choosing which columns a page draws.** The columns are written by the page; nothing lets an
operator add or hide one.

**Continuous scrolling.** The list is paged because the server pages by offset: appending windows of
a set that moves under the reader duplicates and skips records, and the error grows with the
scroll. Keyset pagination on the server is what would reopen this.

---

← [Design documentation](index.md)
