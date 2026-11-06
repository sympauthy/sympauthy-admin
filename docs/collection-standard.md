---
description: How the panel reads a paged collection — the document each one publishes, what it
  asks of it, the state the screen listing it holds, and what it hands the design system to draw it.
paths:
  - "src/features/browse-collection/**"
  - "src/shared/api/Collection*.ts"
  - "src/entities/*/api/**"
  - "src/pages/**/api/**"
  - "src/pages/**/ui/*Page.vue"
---

# Collection standard

A collection is a paged resource of the admin surface and everything the panel does with one: the
document it publishes about itself, what a caller asks of it, the state the screen listing it holds,
and the components it is drawn with. [The server's collection
standard](https://github.com/sympauthy/sympauthy/blob/main/docs/collection-standard.md) owns the
grammar; this one owns what the panel makes of it.

**A collection is browsed by [`features/browse-collection`](../src/features/browse-collection), over
the wire [`shared/api`](../src/shared/api) declares, and drawn by the design system.**
[Table](https://sympauthy.github.io/sympauthy-design/components/table),
[TableFilters](https://sympauthy.github.io/sympauthy-design/components/table-filters),
[TableSort](https://sympauthy.github.io/sympauthy-design/components/table-sort),
[Pagination](https://sympauthy.github.io/sympauthy-design/components/pagination) and
[TableEnd](https://sympauthy.github.io/sympauthy-design/components/table-end) own how each part
looks and behaves. This standard owns what the panel hands them.

**The panel holds no list of filters.** Every field a collection can be narrowed by is read from
that collection at runtime, because the set is the deployment's — its claims, its clients, its
audiences, its scopes — and no build knows it.

## The capability document

**A collection publishes what it accepts at `capabilities` under its own path**, and the panel reads
it as a `CollectionCapabilitiesResource`. `useCollection` hands each part of it on:

| The document's | Becomes |
| --- | --- |
| `filters` | the `fields` of `useSaFilters`, through `saFilterKnownFields` |
| `sorts` | the `fields` of `useSaSort` |
| `default_sort` | the `defaultKeys` of `useSaSort`, through `collectionSortKeys` |
| `search.fields` | whether the collection is `searchable` |

**The document is requested beside the first page, never before it.** The first page carries no
criteria, so nothing about it waits; `SaTableFilterPicker` and the search field appear when the
document lands.

**It is requested beside the first page of the screen asking for it.** It describes the collection
rather than a row, so it reads the same under every parent — but the state that would keep it
across records is the state that dies with the screen, and a view opened on the next record asks
again.

**A read that failed is asked for again by the next page request.** There is nothing to keep, and a
transient failure must not leave a collection without its filters until the tab is reloaded.

**A failed document is a warning, not a page failure.** The records still list, and
`capabilitiesError` is what makes `CollectionPage` draw a `warning` `SaAlert` above the table.

## The page

**A collection is drawn by `CollectionPage`, which is the page's root element**, and it is handed
the collection whole:

```html
<CollectionPage :collection="users" :search-placeholder="t('pages.users.search')">
```

**`CollectionPage` assembles the design system's table from that collection, so no page does.**

| Part | Drawn by | Read from the collection |
| --- | --- | --- |
| the table | `SaTable`, `fill` and `auto-page-size` | `loading`, `error`, `items`, `setSize` |
| the search field | `SaInput`, in `#toolbar` | `searchable`, `query`, `setSearch` |
| adding a filter | `SaTableFilterPicker`, in `#toolbar` | `filters` |
| the order on a phone | `SaTableSort`, in `#toolbar` | `sort` |
| re-reading the list | `CommonButton`, in `#toolbar` | `fetch`, at the page displayed |
| the filters applied | `SaTableFilters`, in `#filters` | `filters`, and `total` in `#summary` |
| the pager, from `sm:` | `SaPagination`, in `#footer` | `page`, `totalPages`, `size`, `total`, `fetch` |
| the end of the list, below `sm:` | `SaTableEnd`, after `#rows` | `hasMore`, `moreLoading`, `moreError`, `total`, `fetchMore` |

**A page writes its columns, its rows and its `empty` sentence, and nothing else.** `CollectionPage`
forwards them to `SaTable`'s `#header`, `#rows` and `#empty`, and [the page layout
standard](page-layout-standard.md#table-rows) says what a row holds.

**The feature's `index.ts` publishes what a page names** — `useCollection`, `CollectionPage`. From
the package a page names `SaTableHeader` and `SaTableCell`, and never what the table above lists.

**A column over a field of the collection hands its `SaTableHeader` `sorting`, `field` and
`filtered-label`, and any other column none of them.** A field the document does not order on draws
as any other, so a page never decides that itself.

```html
<SaTableHeader :sorting="users.sort" field="status" :filtered-label="users.filteredLabel('status')">
  {{ t('pages.users.status') }}
</SaTableHeader>
```

**A column's label is the page's own string, from `pages.<route>`.** The document names a filter and
a sort key; a column is a different question, and some columns are not fields at all.

**A header's field is the wire name the collection publishes.** A name no collection knows silently
renders an unsortable column, so it is read off the capability document rather than guessed.

**The search field appears where the collection is `searchable`**, and nowhere else — which is the
document's answer, not a prop.

**The search field is bound to `query`, never left to the DOM.** `query` is what the request is
built from, so a value the DOM holds and it does not is a search the collection is never narrowed
by.

**`SaTable`'s `page-size-change` is answered by `setSize`,** which asks again for the page holding
the first record displayed, so resizing keeps the operator roughly in place.

**Below `sm:` a collection grows rather than pages, while `useSaListGrows` holds.** `CollectionPage`
ends the page's rows with a `SaTableEnd` and draws no `SaPagination`; `fetchMore` adds the page after
the last one read below the rows, through `moreLoading` and `moreError` rather than `loading` and
`error`, so the rows already read stay while the next arrive or fail. A page is
`GROWING_PAGE_SIZE`, 20 rows, which more than fills a phone, and `SaTable` measures no size there.

**A list that grows reads its first page again wherever a paged one would read the page displayed.**
The table's wait replaces the rows and the scroll with them, so the refresh and a mutation's refetch
start it over rather than leave a later page alone. Crossing `sm:` reads the first page too, in the
other way.

**What the page could not draw goes in the `notice` slot**, above the table.

## Criteria

**What narrows and what orders a collection are held by the package while they are on screen.**
`useCollection` holds a `useSaFilters`, a `useSaSort` and the free text as `query`, and
`CollectionCriteria` is what the three travel as: `SaFilterCriterion`s, `SaSortKey`s and a string.

**A page hands neither the fields nor the words.** The fields come from the document, and the words
from the bundle through `useCollectionLabels`, which builds the `SaFilterLabels` and `SaSortLabels`.

**`collectionQueryParams` is the only thing that writes the grammar.** A bare `field=` for `eq` and
a dotted suffix for everything else, `in` comma-separated, `sort` an ordered list each descending
under a leading `-`, `q` the free text. Nothing else builds a query parameter.

**It reads what is answerable: `filters.complete` and `sort.asked`.** A filter still being filled
would be a `400` while the operator is typing, and the comma an `in` travels under stays in this one
place, so no operator learns the separator.

**`is_null` is offered as *is empty* and sends `true`.** The panel does not offer its other half; a
caller wanting *carries any value* writes the query string themselves.

**A filter or a search is asked of the server once it has settled**, after `CRITERIA_DELAY_IN_MS`.
The order, the pager and `setSize` are each one deliberate act and are not delayed.

**A change of filter, search or order asks for the first page.** A narrowed collection has a
different first page, so the one being read is never the one to come back to.

**Only the last request asked for is painted.** A debounced filter and a press on the pager can be
in flight together, and the one that answers last is not the one the caller is waiting for.

## A page holds a collection

**The screen listing a collection holds it, and holds it alone.** The page an operator is on, the
filters they opened and the order they asked for belong to that screen: another screen over the same
records starts where its own caller left it, and a dialog listing them cannot move the list behind
it.

**A page calls one `useCollection` per collection it lists, under the plural of what it holds**, and
hands it to `CollectionPage` whole. Its first read is `load()`, in `onMounted`.

**A phone's list left for one of its rows is handed back to the operator returning to it.** The rows
read, the page reached, the criteria, the document and the scroll are kept by `CollectionReturn`
under the screen's path, from the moment the operator opens a path under it until they come back to
it or go anywhere else, and `load()` then reads nothing. A phone pays a request per page it scrolled
through, and finds itself back at the top without this; a list from `sm:` holds one page and is read
again, as a screen reached from the sidebar always is.

**It constructs the entity's client itself.** `const api = new UserApi()` at the top of the setup:
the entity publishes the client, the resources and the schemas, and the page is where they meet the
action that browses them.

**A collection under a record reads that record's identifier at call time**, from the route rather
than from state of its own:

```ts
const api = new UserApi()
const userId = computed(() => route.params.userId as string)

const claims = useCollection<UserClaimResource, UserClaimListResource>({
  capabilities: () => api.getUserClaimCapabilities(userId.value),
  page: (params) => api.listUserClaims(userId.value, params),
  items: (content) => content.claims
})
```

**A parameter the collection reads for something other than a criterion is a `selection`.**
`/admin/users`'s `claims` picks what is published rather than what is kept, so it travels beside the
criteria and is not resolved against the document.

**Nothing resets a collection.** A record's shell unmounts the tab before re-reading the record, so
the rows, the failure and the spinner of the record being left go with the screen that asked for
them.

**A mutation over the rows a page lists belongs to that page**, refetches the collection at the page
displayed, and records its failure in `<collection>.error`.

**A store holds what more than one screen reads**, and a collection is never that. `allClients` and
`allAudiences` are every record there is, for a picker in a dialog; the accounts screen reads the
claims an account is identified by from the claim entity's store. A complete list is its own state
and never a collection's rows.

**`fetchAllPages` is what walks one.** One copy of the loop, one place where a server capping the
page size below the one asked for stops it rather than re-reading the same window.

## The client

**A collection's list call takes `CollectionParams`,** and a collection reading a parameter of its
own extends it and names that one. A criterion is not a parameter anything declares: it arrives
through the index signature.

**The wire lives in `shared/api` and nothing above it reaches an entity.** `CollectionParams`, the
`CollectionPageResource` every list answers with, `CollectionCapabilitiesResource` with its schema,
the closed sets of operators and field types it is written in, and `fetchAllPages`: a client and a
store read those, and what the panel makes of them is the feature's.

**A collection's client publishes a `get…Capabilities` beside its `list…`,** with the path written
in full as [the API standard](api-standard.md#clients) requires.

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

**A collection under a record is one of the views of that record.** [The page layout
standard](page-layout-standard.md#record-pages) says what the shell around it is, and each view is a
route, so the one an operator is on is addressable and survives a reload.

**From `sm:` a record's views are a `RecordTabs` strip, and on a phone a `SaRecordViews`**, as
[Navigation](https://sympauthy.github.io/sympauthy-design/foundations/navigation) has it. Both read
one list of views, so neither offers what the other does not.

**From `sm:` a record's route opens the first view every one of its records has**, under the name
that lists them on a phone, so a `router.push` naming the record still works and the URL names a
view. A view some records carry and others do not cannot be what a URL falls back to.

**A view exists for each of the record's collections, and one more per view the record holds that is
neither a collection nor part of the record itself.** A user's views are its collections; a session
adds its purposes to its places.

**What identifies or qualifies the record sits in the shell, not in a view.** A session's status
sits beside its identifier, so what became of it is read whichever view is open.

**A view names itself and carries its explanation**, all read under the route it opens:
`pages.<route>.title`, `pages.<route>.summary` for `SaRecordViews`, and the `help` triple beside
them. The tab is the view's title, so the `DocHelpTooltip` belongs against it rather than inside the
page.

**A view's page repeats neither.** Nothing renders a `SaDetailSection` titled the way the tab that
opened it already is, and nothing draws a second tooltip for what the strip above it explains.

**A shell re-reads its record only when the identifier changes.** Moving between views must not
refetch it.

## What this standard does not cover

**Criteria in the URL.** They live with the screen that asked for them and a reload clears them,
tracked by [#133](https://github.com/sympauthy/sympauthy-admin/issues/133).

**Ordering on more than one key.** The grammar takes a list and `useSaSort` asks for one key at a
time, and nothing offers a second.

**Caching a capability document across screens.** Each collection reads its own, once per session of
that screen, and nothing revalidates.

**One filter surface.** The search field and `SaTableFilters` are two controls. A single input
searching fields and values together was weighed against them and left: a value search reaches a
closed set only, and an open one degrades to a guess per text field — the row can still collapse
into the field later without touching the grammar.

**`or` and grouping.** The server composes criteria with `and` only, and nothing here could express
anything else.

**Choosing which columns a page draws.** The columns are written by the page; nothing lets an
operator add or hide one.

**A list that grows from `sm:`.** It pages there, so an operator can jump around a long one.

**A list that grows over a set that moves.** The server pages by offset, so a record added or
removed ahead of the rows a phone has read shifts the next page by one, and a row is repeated or
skipped. The design system grows a phone's list anyway, since a pager makes a phone hop from page to
page, and the panel accepts the drift there: on a phone, a page is 20 rows of a list an operator
re-reads by refreshing. Keyset pagination on the server is what would end it.

---

← [Design documentation](index.md)
