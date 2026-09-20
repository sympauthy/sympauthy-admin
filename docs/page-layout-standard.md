---
description: What a route, a collection page and a record page are made of, how a table's columns
  are sized, and how each adapts to the width it is given.
paths:
  - "src/pages/**"
  - "src/app/**"
---

# Page layout standard

Two shapes of screen carry everything the panel does: one collection, and one record with its
collections under it. [The design system standard](design-system-standard.md) owns the components
both are built from, and [the collection standard](collection-standard.md) what a collection page
reads.

## A route per screen

**A resource is `/<resource>` and a record `/<resource>/:<resource>Id`.** `/users` and
`/users/:userId`.

**A collection hanging off a record is a child route named after it.** `/users/:userId/claims`,
`/sessions/:sessionId/security-contexts` — the path mirrors the one the API publishes it under.

**A route is named in camelCase, after what it shows.** `users`, `userDetail` — the name is what a
breadcrumb and a `router.push` refer to.

**The page slice is named after the route, in kebab-case**, and publishes its route component only:
`pages/user-detail` exports `UserDetailPage`.

**A route states `requiresAuth` and its breadcrumb in `meta`.** The breadcrumb carries the i18n key
of its label, and a record route also the `parent` route name it hangs under.

```ts
{
  path: '/users/:userId',
  name: 'userDetail',
  component: UserDetailPage,
  redirect: { name: 'userClaims' },
  meta: { requiresAuth: true, breadcrumb: { label: 'pages.userDetail.title', parent: 'users' } },
  children: [{ path: 'claims', name: 'userClaims', component: UserClaimsPage, meta: { … } }]
}
```

**A screen rendered outside the panel shell sets `noLayout: true` and `requiresAuth: false`.** The
callback and the invitation registration are the two.

**A detail page names its own record in the breadcrumb** by calling `useBreadcrumb().setLabel()`
once the record has arrived, falling back to the identifier in the path.

**A record's route carries the breadcrumb for every tab under it**, and redirects to its first tab
so the URL always names a view.

## Page actions

**What a screen lets an operator do is a `PageActions`.** It draws the control in the bar naming the
screen, so it sits in one position on every screen and does not move when a filter appears
under it. Nothing else goes in that bar.

**A collection's action is a button, and a record's actions an `ActionsDropdown`.** A collection has
one or two — open a create dialog, re-read a live list — and a record has a set, read together.

**A record's action stays with the record, even where it fills a tab below it.** Enrolling a factor
and linking a provider each create a record in a tab under the account, and are listed beside
forcing a logout all the same: an action an operator has to open a tab to find is one they have to
know about first. **A tab adds nothing to the bar** — one screen, one set of actions.

**The shell owns the menu and every dialog it opens.** It holds the flag each is opened by, and the
summary panel under it renders the record and nothing else.

**A screen outside the panel shell has no bar, and so no actions.** The callback and the invitation
registration are the two.

## Collection pages

**A page showing a collection is built from `CollectionPage`, and `CollectionPage` is the page's
root element.** [The collection standard](collection-standard.md#the-page) owns what it is handed
and what it draws; this section owns where it sits.

**The page never scrolls.** Rows scroll inside the table, under a pinned header row and above a
pinned pagination bar.

**The number of rows per page is derived from the height available**, down to one where one is
all that fits — a card below `sm:` is several times the height of the row it replaces, so a floor
written for rows would put the list back into a scroll. `PaginatedTable` measures it
and emits `page-size-change`; the collection answers by refetching at the new size.

**The `empty` slot is a sentence from the bundle**, not a blank table.

**Below `sm:` the table is drawn as a card per record**, by `PaginatedTable`, from the same `#header`
and `#rows` a wider screen reads. A page describes its records once; it does not write a phone
layout of its own, and a column added to it reaches the phone with it.

## Table columns

**A column is a `CollectionSortHeader` where the collection may order on it, and a `TableHeader`
where it may not.** Both draw the same header; only one of them responds to a click.

**Every cell under one is a `TableCell`.** Neither a page's header nor its rows write a padding, a
text size or a colour — [the design system standard](design-system-standard.md#the-scale) says which
step each takes, and the component takes it.

| Kind of column | Props on the header | Props on the cell |
| --- | --- | --- |
| status, date, actions | `fit` | `fit` |
| name, identifier, value | none | `truncate` |
| the column identifying the record | — | `primary` |
| an address, a token, a key | — | `mono` |
| secondary, dropped on a phone | `hidden-below="sm"` | `hidden-below="sm"` |
| secondary, dropped below a desktop | `hidden-below="lg"` | `hidden-below="lg"` |

**A `fit` column takes only the space its content needs, and a column without it takes the rest.**
That is the whole sizing model.

**Never write a fixed width.** `w-[100px]` and `w-[10%]` hold at one breakpoint and break at the
next, and `PaginatedTable` keeps `table-layout: auto` for that reason.

**A cell the record has no value for holds an `EmptyValue`.** A blank cell and a cell the fetch did
not fill read alike; a dash does not.

**A cell's `hidden-below` matches its header's.** They are two components and one column, and a
column dropped on a phone stays dropped once the row is a card.

**Every cell carries its column's name as `label`,** which is what the card shows above the value.
The two that do not are the `primary` cell, which is the card's title, and the cell holding the
row's actions.

## Record pages

**A record's page is a shell: its summary panel, a `RecordTabs` strip, and the tab's own page
filling what is left.** Its root is `flex h-full min-h-0 flex-col`, so the tab below the strip gets
a height and its table scrolls rather than the page.

**A record's page renders loading, error and content, and resets its store in `onMounted` before
fetching.** The wait is a `LoadingState` and the failure a `CommonAlert`. It re-reads the record
when the identifier changes and not when the tab does.

**The first thing on the page is a `SummaryCard` of `SummaryField`s**, one per value that identifies
the record, and no heading — the bar above names the record and carries what is done to it. The
record's identifier is a `CopyableValue`.

**Everything below it is a `DetailSection`,** whose `#help` slot takes the `HelpTooltip` when the
section needs one.

**A section is laid out by what it holds:**

| Holds | Rendered as |
| --- | --- |
| fields of one record | a `DefinitionList` of `DefinitionRow`s |
| plain values | a `CommonCard` listing them |

**Records are not a section.** A paged set of them is a collection, and a collection is a tab of its
own — [the collection standard](collection-standard.md#a-collection-under-a-record) says how one
hangs off a record.

**A section is a `…Panel.vue` in the page's slice, and it takes what it renders as props.** The
record is fetched once by the shell, so a section below it reads what is already there.

**A section is never an action.** [Page actions](#page-actions) says where those go and which
component owns them.

## The widths it is for

**The panel is built for 360px and up.** That is the narrowest phone still in use; below it nothing
is checked and nothing is promised.

**It stops growing at `max-w-page`**, the `--container-page` token in
[the global stylesheet](../src/app/styles/style.css), and centres past it. A label and the value
beside it drifting a monitor apart is not more readable for the room.

**Three arrangements carry that range, and there is no fourth.**

| Width | Sidebar | A collection | A record's fields |
| --- | --- | --- | --- |
| 360–639 | drawer, behind a header | a card per record | one column |
| 640–1023 (`sm:`) | drawer | a table | three columns |
| 1024+ (`lg:`) | permanent | a table | three columns |

**Write the phone layout first and add the wider ones with `sm:` and `lg:`.** The panel uses
Tailwind's default breakpoints and only those two.

**Nothing scrolls sideways at any supported width** — not the page, and not a table inside it. A
column that cannot be made to fit is dropped with `hidden-below`, not left to overflow. The one
exception is `RecordTabs`, which scrolls its strip because dropping a tab would hide a view.

**The sidebar is a drawer below `lg:` and permanent from it.** `useSidebar` holds the state and
closes it on navigation; `AdminLayout` draws the backdrop and the mobile header; `SidebarNav` is
sized by its parent (`h-full w-full`), never by itself.

**Padding steps once**: `p-4` becomes `lg:p-6` for the page, and `CommonCard` steps its own from
`p-4` to `sm:p-6`. [The design system standard](design-system-standard.md#the-scale) holds the
whole scale.

**A toolbar is one row at every width.** Its controls give up their labels rather than their
place — a second row costs the list below it a record, and the field beside them still reads.

**A pagination bar is one row too.** Below `sm:` it drops the range it reads and centres the pager,
which already says which page of how many; a phone is not told the same thing twice at the price of
a record.

## What this standard does not cover

**A `md:` layout.** No screen has a third arrangement.

**Filters in the URL.** A search or a filter lives in its store, and reloading a collection page
clears it; [#133](https://github.com/sympauthy/sympauthy-admin/issues/133) tracks ending that.

**Which fields a card shows, and how tightly.** A card stacks every column a phone keeps, a label
over each value, so a screen reads one or two records;
[#136](https://github.com/sympauthy/sympauthy-admin/issues/136) tracks curating and tightening it.

**Dashboards.** Every screen shows one collection or one record.

**Printing and keyboard shortcuts.** Neither is considered.

---

← [Design documentation](index.md)
