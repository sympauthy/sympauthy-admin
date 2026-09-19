---
description: What a route, a list page and a detail page are made of, how a table's columns are
  sized, and how each adapts to the width it is given.
paths:
  - "src/pages/**"
  - "src/app/**"
---

# Page layout standard

Two shapes of screen carry everything the panel does: a list of one resource, and the detail of one
record. [The design system standard](design-system-standard.md) owns the components both are built
from.

## A route per screen

**A resource is `/<resource>` and a record `/<resource>/:<resource>Id`.** `/users` and
`/users/:userId`.

**A route is named in camelCase, after what it shows.** `users`, `userDetail` — the name is what a
breadcrumb and a `router.push` refer to.

**The page slice is named after the route, in kebab-case**, and publishes its route component only:
`pages/user-detail` exports `UserDetailPage`.

**A route states `requiresAuth` and its breadcrumb in `meta`.** The breadcrumb carries the i18n key
of its label, and a detail route also the `parent` route name it hangs under.

```ts
{
  path: '/users/:userId',
  name: 'userDetail',
  component: UserDetailPage,
  meta: { requiresAuth: true, breadcrumb: { label: 'pages.userDetail.title', parent: 'users' } }
}
```

**A screen rendered outside the panel shell sets `noLayout: true` and `requiresAuth: false`.** The
callback and the invitation registration are the two.

**A detail page names its own record in the breadcrumb** by calling `useBreadcrumb().setLabel()`
once the record has arrived, falling back to the identifier in the path.

## List pages

**A list page is built from `ListPage`, and `ListPage` is the page's root element.** Nothing wraps
it, so its toolbar and its table fill the height the layout gives them.

**The page never scrolls.** Rows scroll inside the table, under a pinned header row and above a
pinned pagination bar.

**The number of rows per page is derived from the height available.** `PaginatedTable` measures it
and emits `page-size-change`; the store answers by refetching at the new size.

**A list page wires the store into `ListPage` whole:**

```html
<ListPage :loading="store.loading" :error="store.error" :empty="store.users.length === 0"
  :page="store.page" :size="store.size" :total="store.total" :total-pages="store.totalPages"
  @page-change="store.fetchUsers" @page-size-change="store.setSize">
```

**`searchable` is set only on a resource whose list endpoint takes a free text query.** Today the
users and the interactive flow sessions.

**A filter is a `FilterConfig` the page computes**, and its change and removal are answered by the
store method that owns that filter.

**A column the list endpoint can sort on is a `SortableHeader`**, handed the store's `sortField` and
`sortOrder` and emitting back into `toggleSort`.

**The `empty` slot is a sentence from the bundle**, not a blank table.

## Table columns

| Kind of column | Classes on `<th>` | Classes on `<td>` |
| --- | --- | --- |
| status, date, actions | `w-0 whitespace-nowrap` | `whitespace-nowrap` |
| name, identifier, value | none | `truncate` |
| secondary, hidden on a phone | `hidden sm:table-cell` | `hidden sm:table-cell` |

**A shrink-wrap column takes only the space its content needs, and a fill column takes the rest.**
That is the whole sizing model.

**Never write a fixed width.** `w-[100px]` and `w-[10%]` hold at one breakpoint and break at the
next, and `PaginatedTable` keeps `table-layout: auto` for that reason.

**A cell is `px-6 py-4`, and a header cell `px-6 py-3`.** A phone's narrower padding is applied
globally, not per page.

**The primary column is `font-medium text-gray-900`.** It identifies the record; a `Tag` is for a
status.

## Detail pages

**A detail page renders loading, error and content, and resets its stores in `onMounted` before
fetching.** The requests that fill the page are awaited together.

**The first thing on the page is the summary panel**: a card, `bg-white rounded-lg border
border-gray-200 p-4 sm:p-6`, holding a grid of labelled values and no heading. The record's
identifier carries a `CopyToClipboard`, and the record's actions an `ActionsDropdown`.

**Everything below it is a `DetailSection`,** whose `#help` slot takes the `HelpTooltip` when the
section needs one.

**A section is laid out by what it holds:**

| Holds | Rendered as |
| --- | --- |
| records | a `PaginatedTable` directly in the slot, with no card around it |
| fields of one record | a `<dl>` in a card, a row per field |
| plain values | a card listing them |

**A row of a definition list is `px-4 py-3 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4`,** its `<dt>`
the label and its `<dd>` the value.

**A section is a `…Panel.vue` in the page's slice, and it reads its own store.** The page hands it
the identifier from the route and nothing else.

**The page owns the dialogs.** It holds the flag each is opened by, and a panel asks for one by
emitting.

## Adapting to width

**Write the phone layout first and add the wider ones with `sm:` and `lg:`.** The panel uses
Tailwind's default breakpoints and only those two: `sm:` for a large phone and above, `lg:` for a
desktop.

**The sidebar is a drawer below `lg:` and permanent from it.** `useSidebar` holds the state and
closes it on navigation; `AdminLayout` draws the backdrop and the mobile header; `SidebarNav` is
sized by its parent (`h-full w-full`), never by itself.

**Padding steps once**: `p-4` becomes `lg:p-6` for the page, and a card is `p-4 sm:p-6`.

**A toolbar or a pagination bar stacks on a phone and goes side by side from `sm:`.**

**A control whose label does not fit shows its icon alone below `sm:`,** keeping the label as a
`title`.

## What this standard does not cover

**A `md:` layout.** No screen has a third arrangement.

**Filters in the URL.** A search or a filter lives in its store, and reloading a list page clears
it.

**Dashboards.** Every screen shows one resource.

**Printing and keyboard shortcuts.** Neither is considered.

---

← [Design documentation](index.md)
