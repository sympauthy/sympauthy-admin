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

## Collection pages

**A page showing a collection is built from `CollectionPage`, and `CollectionPage` is the page's
root element.** [The collection standard](collection-standard.md#the-page) owns what it is handed
and what it draws; this section owns where it sits.

**The page never scrolls.** Rows scroll inside the table, under a pinned header row and above a
pinned pagination bar.

**The number of rows per page is derived from the height available.** `PaginatedTable` measures it
and emits `page-size-change`; the collection answers by refetching at the new size.

**A page action is the `actions` slot**, beside the toolbar: the button that opens a create dialog,
the one that re-reads a live list, the `HelpTooltip` explaining what the collection holds.

**The `empty` slot is a sentence from the bundle**, not a blank table.

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

**A cell's `hidden-below` matches its header's.** They are two components and one column.

## Record pages

**A record's page is a shell: its summary panel, a `RecordTabs` strip, and the tab's own page
filling what is left.** Its root is `flex h-full min-h-0 flex-col`, so the tab below the strip gets
a height and its table scrolls rather than the page.

**A record's page renders loading, error and content, and resets its store in `onMounted` before
fetching.** The wait is a `LoadingState` and the failure a `CommonAlert`. It re-reads the record
when the identifier changes and not when the tab does.

**The first thing on the page is a `SummaryCard` of `SummaryField`s**, one per value that identifies
the record, and no heading. The record's identifier is a `CopyableValue`, and the record's
actions go in the card's `#actions` slot as an `ActionsDropdown`.

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

**The shell owns the dialogs its summary opens.** It holds the flag each is opened by, and the
summary asks for one by emitting. A dialog belonging to one tab is that tab's.

## Adapting to width

**Write the phone layout first and add the wider ones with `sm:` and `lg:`.** The panel uses
Tailwind's default breakpoints and only those two: `sm:` for a large phone and above, `lg:` for a
desktop.

**The sidebar is a drawer below `lg:` and permanent from it.** `useSidebar` holds the state and
closes it on navigation; `AdminLayout` draws the backdrop and the mobile header; `SidebarNav` is
sized by its parent (`h-full w-full`), never by itself.

**Padding steps once**: `p-4` becomes `lg:p-6` for the page, and `CommonCard` steps its own from
`p-4` to `sm:p-6`. [The design system standard](design-system-standard.md#the-scale) holds the
whole scale.

**A toolbar or a pagination bar stacks on a phone and goes side by side from `sm:`.**

**A button repeated down a table is passed `collapseLabel`,** which shows its icon alone below
`sm:` and keeps the label as a `title`. A button standing on its own keeps its label at every
width.

## What this standard does not cover

**A `md:` layout.** No screen has a third arrangement.

**Filters in the URL.** A search or a filter lives in its store, and reloading a collection page
clears it; [#133](https://github.com/sympauthy/sympauthy-admin/issues/133) tracks ending that.

**Dashboards.** Every screen shows one collection or one record.

**Printing and keyboard shortcuts.** Neither is considered.

---

← [Design documentation](index.md)
