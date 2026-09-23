---
description: How the panel reads a paged collection — the document each one publishes, the criteria
  built against it, the state the screen listing it holds, and the page it is drawn as.
paths:
  - "src/features/browse-collection/**"
  - "src/shared/api/Collection*.ts"
  - "src/entities/*/api/**"
  - "src/pages/*/api/**"
  - "src/pages/*/ui/*Page.vue"
---

# Collection standard

A collection is a paged resource of the admin surface and everything the panel does with one: the
document it publishes about itself, the criteria a caller builds against that document, the state
the screen listing it holds, and the page it is drawn as. [The server's collection
standard](https://github.com/sympauthy/sympauthy/blob/main/docs/collection-standard.md) owns the
grammar; this one owns what the panel makes of it.

**A collection is browsed by [`features/browse-collection`](../src/features/browse-collection),
over the wire [`shared/api`](../src/shared/api) declares.** The parameters a list call takes and the
document it publishes are what every entity's client speaks; the state, the criteria and the
components a caller browses with are the action every list page is built from.

**The panel holds no list of filters.** Every field a collection can be narrowed by is read from
that collection at runtime, because the set is the deployment's — its claims, its clients, its
audiences, its scopes — and no build knows it.

## The capability document

**A collection publishes what it accepts at `capabilities` under its own path**, and the panel reads
it as a `CollectionCapabilitiesResource`: the fields it filters on with the operators each admits,
the fields it orders on, the fields a free text `q` matches, and its default sort.

**The document is requested beside the first page, never before it.** The first page carries no
criteria, so nothing about it waits; the toolbar appears when the document lands.

**It is requested beside the first page of the screen asking for it.** It describes the collection
rather than a row, so it reads the same under every parent — but the state that would keep it across
records is the state that dies with the screen, and a tab opened on the next record asks again.

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

**An incomplete criterion is left out of the request.** A filter the caller has opened and not filled
narrows nothing, and sending it would be a `400` while they are still typing.

**A criteria change is asked of the server once it has settled**, after
`CRITERIA_DELAY_IN_MS`. Paging, sorting and resizing are each one deliberate act and are not
delayed.

**Adding a filter asks the collection again only where that filter is already answerable.** One
holding no value narrows nothing and waits to be filled in; one whose operator takes none — a field
opening on `is_null` — is answerable the moment it is added, and the list under it has to say so.

**A criteria change asks for the first page.** A narrowed collection has a different first page, so
the one being read is never the one to come back to.

**Only the last request asked for is painted.** A debounced criteria change and a page click can be
in flight together, and the one that answers last is not the one the caller is waiting for.

## A page holds a collection

**The screen listing a collection holds it, and holds it alone.** The page an operator is on, the
filters they opened and the order they asked for belong to that screen: another screen over the same
records starts where its own caller left it, and a dialog listing them cannot move the list behind
it.

**A page calls one `useCollection` per collection it lists, under the plural of what it holds**, and
hands it to `CollectionPage` whole.

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

## The page

**A collection is drawn by `CollectionPage`, which is the page's root element**, and it is handed
the collection whole:

```html
<CollectionPage :collection="users" :search-placeholder="t('pages.users.search')">
```

**The components are the feature's**, and its `index.ts` publishes what a page names —
`useCollection`, `CollectionPage`, `CollectionSortHeader`. The toolbar, the filters and the value
controls are parts of that page rather than pieces of the kit, so nothing outside the slice reaches
them.

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

**Every control is bound to the criteria, never left to the DOM.** The criteria are what the
request is built from, so a value the DOM holds and they do not is a filter the collection is never
narrowed by.

**What the page could not draw goes in the `notice` slot**, above the table. The toolbar says the
same of a capability document it failed to read.

## The filter bar

**A filter is a control, and never a chip.** It takes the box every other control shares — one
height, one radius, one border — because the row it sits in is under the row holding the search
field, and a tag beside a field is two families on one screen.

**A filter holds its own box with `.control-focus-within`.** The trigger reading it and the control
removing it are two focusable parts of one control, so the box shows the focus either of them
takes and removing a filter stays one press.

**A filter reads its criterion as a sentence** — the field, the operator, the value — and truncates
it, since a value has no length the panel knows. The value stands in as
`common.collection.selectValue` until there is one.

**The fields are searched, not read down.** `CollectionFieldPicker` is a popover over a
`FormListbox`, because the set is the deployment's: an instance publishing a field per claim renders
a menu taller than the viewport, and a menu has nowhere to type.

**The operator and the value are filled in from the filter's own popover.** Inside the sentence
neither had room for a box, and a control without one cannot be seen.

**A filter opens on the operator its field's type reads best and offers the rest the field
admits.** `contains` over text, `eq` over a word, `gte` over a number or a moment; a field narrowing
its set falls back to the first operator it lists.

**The value control is the set the field publishes, or the field's type where it publishes none:**

| The field | The control |
| --- | --- |
| publishes `values` | a `FormListbox` of them, `multiple` under `in` |
| `boolean` | the same list, over the *Yes* and *No* the panel names |
| under `in` publishing no values | a `FormTagsInput`, one value entered at a time |
| `date`, `date_time` | a date or datetime input |
| `number` | a number input |
| `string`, `email`, `phone_number`, `uuid`, `timezone` | a text input |
| under `is_null` | none |

**`collectionFilterValues` answers which of the two a field is.** It reads the published values
whatever the field's type, and gives a boolean the set of two the panel names rather than the
server.

**The comma stays in `collectionQueryParams`.** A list is entered one value at a time, so no
operator learns the separator the values travel under.

**A newly added filter opens on its value.** `addFilter` answers the criterion's id and the toolbar
holds it, so the control it created opens focused on what the caller opened the field list to
write.

**Enter in a value field closes the popover.** The value is written and the two controls above it
already say the rest. Neither list reads Enter that way — one adds a value with it and the other
picks one — and an input method confirming a candidate is not a caller pressing it.

**A criterion still incomplete when its popover closes is dropped.** It narrows nothing, and
leaving it on the row is a sentence that stops halfway beside an affordance an operator has to
guess at.

**Changing a filter's operator clears its value.** `in` holds a list where the others hold one, so
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

**What identifies or qualifies the record sits in the shell, not in a tab.** A session's status sits
beside its identifier, so what became of it is read whichever tab is open.

**A tab names its view and carries that view's explanation**, both read under the route it opens:
`pages.<route>.title` and the `help` triple beside it. The tab is the view's title, so the
`HelpTooltip` belongs against it rather than inside the page.

**A tab's page repeats neither.** Nothing renders a `DetailSection` titled the way the tab that
opened it already is, and nothing draws a second tooltip for what the strip above it explains.

**A shell re-reads its record only when the identifier changes.** Moving between tabs must not
refetch it.

## What this standard does not cover

**Criteria in the URL.** They live with the screen that asked for them and a reload clears them,
tracked by
[#133](https://github.com/sympauthy/sympauthy-admin/issues/133).

**Ordering on more than one key.** The grammar takes a list and the criteria hold one; a header
names one key at a time, and nothing offers a second.

**Caching a capability document across screens.** Each collection reads its own, once per session of
that screen, and nothing revalidates.

**One filter surface.** The free text field and the row of filters are two controls. A single input
searching fields and values together was weighed against them and left: a value search reaches a
closed set only, and an open one degrades to a guess per text field — the row can still collapse
into the field later without touching the grammar.

**`or` and grouping.** The server composes criteria with `and` only, and nothing here could express
anything else.

**Choosing which columns a page draws.** The columns are written by the page; nothing lets an
operator add or hide one.

**Continuous scrolling.** The list is paged because the server pages by offset: appending windows of
a set that moves under the reader duplicates and skips records, and the error grows with the
scroll. Keyset pagination on the server is what would reopen this.

---

← [Design documentation](index.md)
