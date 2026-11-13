---
description: What a route, a collection page and a record page are made of, and what the panel
  decides about a table's columns and rows.
paths:
  - "src/pages/**"
  - "src/app/**"
---

# Page layout standard

Two shapes of screen carry everything the panel reads: one collection, and one record with its
collections under it. A third, one form, is what an operator changes about the panel itself. [The
design system standard](design-system-standard.md) owns the components each is built from, and [the
collection standard](collection-standard.md) what a collection page reads.

## A route per screen

**A resource is `/<resource>` and a record `/<resource>/:<resource>Id`.** `/users` and
`/users/:userId`.

**A collection hanging off a record is a child route named after it.** `/users/:userId/claims`,
`/sessions/:sessionId/security-contexts` — the path mirrors the one the API publishes it under.

**A route is named in camelCase, after what it shows.** `users`, `userDetail` — the name is what a
breadcrumb and a `router.push` refer to.

**The page slice is named after the route, in kebab-case**, and publishes its route component only:
`pages/audiences` exports `AudiencesPage`.

**A resource with a record groups its routes under the folder its path starts with**, a slice per
route: `list` for the collection, `detail` for the record's shell, and each tab named after the
segment its path adds. `/users`, `/users/:userId` and `/users/:userId/claims` are
`pages/users/list`, `pages/users/detail` and `pages/users/claims`, so a slice is found from the URL.
Steiger counts a group apart from the layer's ungrouped slices, and a record with its tabs is what
pushed `pages/` past the twenty `fsd/excessive-slicing` allows ungrouped.

**`/` is the panel's root rather than a resource.** The guard resolves it to the first page the
token can open, and it renders the no-access page when that is none of them —
[Authentication](authentication.md#what-the-token-granted) owns both.

**A route states `requiresAuth`, the scopes it opens under and its breadcrumb in `meta`.** The
breadcrumb carries the i18n key of its label, and a record route also the `parent` route name it
hangs under.

```ts
{
  path: '/users/:userId',
  name: 'userDetail',
  component: UserDetailPage,
  redirect: { name: 'userClaims' },
  meta: {
    requiresAuth: true,
    requiredScopes: ['admin:users:read'],
    breadcrumb: { label: 'pages.userDetail.title', parent: 'users' }
  },
  children: [{ path: 'claims', name: 'userClaims', component: UserClaimsPage, meta: { … } }]
}
```

**`requiredScopes` names every scope the route's own calls are read under**, and a route under
another states the whole set rather than the difference. A child's `meta` replaces its parent's key,
so `userConsents` names `admin:users:read` beside the `admin:consent:read` its collection needs.

**A screen rendered outside the panel shell sets `noLayout: true`.** The callback and the invitation
registration add `requiresAuth: false`; the no-access page is signed in and stays outside all the
same, since every entry the shell would draw would be disabled.

**A screen outside the shell that an operator reads is a `StandalonePage`**, drawn as the flow's
auth card: the deployment's logo and name naming the panel, one card at the `card` width, and the
product under it. The invitation's sign-up and the no-access page are. A wait such as the callback
draws its spinner alone.

**A detail page names its own record in the breadcrumb** by calling `useBreadcrumb().setLabel()`
once the record has arrived, falling back to the identifier in the path.

**A record's route carries the breadcrumb for every tab under it.** Landing on a record with views
opens the first one every one of its records has from `sm:`, so that the URL names a view, and lists
them on a phone.

**A view's route names itself in `meta.view`**, with the record's route it goes back to. A phone opens
a view as a screen of its own, so `BreadcrumbNav` adds it as the last item there. From `sm:` the bar
names the record, and the view is a tab. What a screen's ancestors draw at each width is [the design
system's Navigation foundation](https://sympauthy.github.io/sympauthy-design/foundations/navigation).

## Page actions

**A screen's actions are drawn where and as
[Breadcrumb](https://sympauthy.github.io/sympauthy-design/components/breadcrumb) and
[Navigation](https://sympauthy.github.io/sympauthy-design/foundations/navigation) have them.**
Nothing else a screen writes goes in that bar.

**A record's action stays with the record, even where it fills a tab below it.** Enrolling a factor
and linking a provider each create a record in a tab under the account, and are listed beside
forcing a logout all the same: an action an operator has to open a tab to find is one they have to
know about first. **A tab adds nothing to the bar** — one screen, one set of actions. The one
exception is a phone's link to the open view's help, first in the record's menu, since a phone has
no tab to draw it beside — or, on a record without views, to what the record is.

**The shell owns the menu and every dialog it opens.** It holds the flag each is opened by, and the
summary panel under it renders the record and nothing else.

**A screen outside the panel shell has no bar, and so no actions.** What one of them lets an
operator do it draws itself, inside its own content — the no-access page's preferences and
sign-out.

## Menus

**The sidebar lists its sections and the entries in each from the most used to the least,** as
[Menu](https://sympauthy.github.io/sympauthy-design/components/menu) orders a menu. The panel keeps
no usage data, so the order is a judgement, written in [the
navigation](../src/app/router/navigation.ts) and at each menu's call site, and revised when it stops
being true.

**The sidebar's first entry is the page the panel lands on**, since `/` sends the operator to the
first entry their token opens — the most used page is therefore the one an operator starts on. The
sidebar's head links to `/`, so it reaches that page whatever the token opens.

**A page about the panel rather than the server is an entry of the last section, marked `landing:
false`.** The preferences open under no scope, so `/` would land every token on them, and one that
opens nothing else would never reach the no-access page.

## Collection pages

**A page showing a collection is built from `CollectionPage`, and `CollectionPage` is the page's
root element.** [The collection standard](collection-standard.md#the-page) owns what it is handed
and what it draws; this section owns where it sits.

**From `sm:` the page never scrolls.** `CollectionPage` hands `SaTable` `fill` and
`auto-page-size`, as [Table](https://sympauthy.github.io/sympauthy-design/components/table)
describes them, and the collection refetches at the size it emits.

**Below `sm:` the card ends with its rows and the page scrolls**, since the list grows as it does;
[the collection standard](collection-standard.md#the-page) says how.

**A page describes its records once, in `#header` and `#rows`, and writes no phone layout of its
own.** `SaTable` lays them out for one, so a column added to a page reaches the phone with it.

## Table columns

**A column is a `SaTableHeader`.** [The collection standard](collection-standard.md#the-page) says
what one over a field of the collection is handed.

**What each prop of a header and a cell is for is
[Table](https://sympauthy.github.io/sympauthy-design/components/table)'s.** A name, an identifier or
a value in a column without `fit` is `truncate`.

**A `primary` cell is also `truncate` where a column beside it is.** A truncated column is capped, so
an uncapped one takes everything the table has left and cuts its neighbours down to their headers,
with the room they needed standing empty. Capped alike, they share it.

## Table rows

**A row reads in one order: what the record is, what state it is in, what else is known of it, what
can be done to it.** The `primary` column comes first and is never a status, the status follows it,
and the actions close the row. Scopes keep their status last, after the claims they publish, which
are what that list is read for.

**A record with a screen of its own is named by a `TableRecord`.** Its `detail` is the identifier
under the name, where the name is not already that identifier. A grant's row has its scope count
under the name instead, as a `caption`, and a phone reads it after the grant type: an operator tells
one person's grants apart by what each holds, and copies a grant's identifier from its record.

**A record with no screen is named by its value alone,** and `mono` where that is an identifier.

**A record is named by what an operator would call it.** An account by its first identifier and a
session by its purpose, each with its identifier under it. A row of identifiers alone has nothing to
tell apart at a glance. A grant is named by the account it was opened for, or by its client where it
names none, since that is what an operator looks one up by.

**A client is named by the display name the configuration gives it, and by its identifier where it
gives none,** wherever the panel shows one. `ClientLink` draws it in a field or a column,
`ClientTableRecord` in the `primary` cell of a row it heads, and `clientReferenceName` everywhere
else; a client the configuration no longer declares reads as its identifier like any other.

**A client drawn by its name carries its identifier under it where the client is what the row or
the field is about** — a row of clients or of consents, a grant's or a session's client field. The
identifier is what the configuration and a search are written in; a column naming the client among
other values, and a grant row named after its client, leave it to the screen they link to.

**A choice between clients shows each by its name with its identifier beside it,** through
`clientChoiceLabel`. Nothing keeps two clients from sharing a name, and the choice is what the
request acts on.

**An item of a row's menu carries no icon, and ends in an ellipsis where a `SaConfirmDialog` follows
it.**

**A row's actions are a `SaTableActions` holding its `ActionsDropdown`.** A row with nothing to
offer keeps the cell and leaves it empty: the cell holds the row's height from `sm:` and draws
nothing on a phone.

**A value naming a record with a screen of its own links to it,** with a `RecordLink`, or a
`TableRecord` where it names the row: the client of a grant, a session or a consent, the user of a
grant, the grant a client acted through. It is `mono` where the name is an identifier, and
`truncate` where its line holds that one value — a summary field, a `truncate` column. A value whose
record has no screen — an audience — stays plain text. A client the configuration no longer
declares still gets its link: the screen it opens says so, which plain text would hide.

**A set of values wraps as tags,** one `SaTag` each, rather than a list joined by commas: the claims
of a scope, the scopes of a consent. A row may be taller for it.

**A value the record has not collected says so,** with a `yellow` tag beside its dash, since a claim
missing and a claim empty are different things to an operator. A date that proves something — a
claim's verification — carries the green check, beside the value it proves rather than in a column
of its own.

## Record pages

**A record's page is a shell: its summary panel, a `RecordTabs` strip, and the tab's own page
filling what is left.** Its root is `flex h-full min-h-0 flex-col`, so the tab below the strip gets
a height and its table scrolls rather than the page.
[RecordPage](https://sympauthy.github.io/sympauthy-design/components/record-page) says what the
summary and the sections hold, and
[Navigation](https://sympauthy.github.io/sympauthy-design/foundations/navigation) what a phone draws
in place of the strip.

**A record's page renders loading, error and content, and resets its store in `onMounted` before
fetching.** The wait is a `SaLoadingState` and the failure a `SaAlert`. It re-reads the record
when the identifier changes and not when the tab does.

**A section is laid out by what it holds:**

| Holds | Rendered as |
| --- | --- |
| fields of one record | a `SaDefinitionList` of `SaDefinitionRow`s |
| a list of one kind of value | a `SaTable` without its `#header`, which the section's title names |

**A scope is a `ScopeTag` wherever it is listed, and a section listing scopes says what each look
means.** A scope's name does not tell a consentable scope from a grantable one, so its tag is all
that does: filled blue, ringed purple, or ink for a client's own. A `ScopeTypeLegend` on the right of
the section's title names all three, whichever the section draws, so the key reads the same on
every record — a client's allowed and default scopes, a grant's three sets.

**Records are not a section.** A paged set of them is a collection, and a collection is a tab of its
own — [the collection standard](collection-standard.md#a-collection-under-a-record) says how one
hangs off a record.

**A section is a `…Panel.vue` in the page's slice, and it takes what it renders as props.** The
record is fetched once by the shell, so a section below it reads what is already there.

**A section is never an action.** [Page actions](#page-actions) says where those go and which
component owns them.

## Form pages

**A page holding a form is one `SaCard` of `SaField`s, capped at `card-large`, with its Save at its
foot.** A form is read down one column, and a field the width of the page puts a radio's label a
screen away from its mark.

**Fields stand `space-6` apart, and a `SaRadioGroup` among them is `-my-3`.** Its rows are as tall
as a target around a line of text, so without it the first option hangs below its label and the
next field drifts further below the last.

**A form page changes nothing until Save, and what was left unsaved is gone when it is left.** It is
local state like a dialog's, so it starts from what is applied each time it opens, and asks nothing
before the operator navigates away.

**What the server will not keep is a `warning` `SaAlert` above the card, and what a Save kept a
status line beside its button.** The warning is there from the startup that found it, not only after
a Save meets it, so the operator knows before choosing anything.

## The widths it is for

**Which widths the panel supports, and where it changes, is
[Layout](https://sympauthy.github.io/sympauthy-design/foundations/layout)'s.**

**`useSidebar` holds the drawer's state and closes it on navigation,** since the package knows no
router.

## What this standard does not cover

**Filters in the URL.** A search or a filter lives with the screen that asked for it, and reloading
a collection page clears it; [#133](https://github.com/sympauthy/sympauthy-admin/issues/133) tracks
ending that.

**Which columns a phone keeps.** Nothing has curated them for a record laid out down, and the
redesign takes that up.

**A view only some of a record's instances carry, and the landing a shell replaces once it has read
the record.** One record does both — a session's failure is a tab a session that ended in one
gets, and the shell moves such a session off the fallback its route redirects to — and a shape
written from the single case that has it states that case rather than a rule. It stays in
[`SessionDetailPage.vue`](../src/pages/sessions/detail/ui/SessionDetailPage.vue) until a second
record needs it.

**Dashboards.** Every screen shows one collection or one record.

**Printing and keyboard shortcuts.** Neither is considered.

---

← [Design documentation](index.md)
