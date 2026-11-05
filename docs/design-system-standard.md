---
description: Which component a screen reaches for, what the panel adds to the design system it draws
  them from, and how a deployment's brand reaches them.
paths:
  - "src/**/ui/**"
  - "src/features/*/ui/**"
  - "src/app/styles/**"
---

# Design system standard

`@sympauthy/design` and `shared/ui` are the kit every screen is assembled from. Reach for them
before writing a component, and add to `shared/ui` rather than beside it. [The component code
standard](component-code-standard.md) says how a component is written; this one says which to use.

**[`@sympauthy/design`](https://sympauthy.github.io/sympauthy-design/)
decides what a thing looks like and when each variant is right; this standard decides which
component a screen uses.** [Its page on this panel](https://sympauthy.github.io/sympauthy-design/admin)
draws the same line. A value or a rule of the system is changed there, and linked rather than
restated here.

## What the design system decides

**A question the table names is answered by that page, and a screen follows it.**

| Question | Foundation |
| --- | --- |
| Which step separates what | [Spacing](https://sympauthy.github.io/sympauthy-design/foundations/spacing) |
| Which style text is set in | [Type](https://sympauthy.github.io/sympauthy-design/foundations/type) |
| What each colour is for | [Color](https://sympauthy.github.io/sympauthy-design/foundations/color) |
| What sets a surface apart, and what its corners say | [Shape](https://sympauthy.github.io/sympauthy-design/foundations/shape) |
| How large anything a person presses is | [Control height](https://sympauthy.github.io/sympauthy-design/foundations/control-height) |
| What focus, disabled and in flight look like, and what moves | [Focus, states and motion](https://sympauthy.github.io/sympauthy-design/foundations/focus) |
| Which icon set, at which size | [Iconography](https://sympauthy.github.io/sympauthy-design/foundations/iconography) |
| Which breakpoints and widths exist | [Layout](https://sympauthy.github.io/sympauthy-design/foundations/layout) |
| What a label, a button or an error says | [Content](https://sympauthy.github.io/sympauthy-design/foundations/content) |
| Which theme a page draws | [Themes](https://sympauthy.github.io/sympauthy-design/foundations/themes) |

**Read [a component's page](https://sympauthy.github.io/sympauthy-design/components/)
before drawing it.** Its `## Usage` says what each variant is for, and each *Not for* names what to
reach for instead.

## The package

**A screen imports a package's component from `@sympauthy/design`, and one of the panel's from
`@/shared/ui`.** What the package names starts with `Sa` and is imported under that name, with no
alias, so a page of its documentation and the template drawing the component agree on what it is
called.

**A component moves to the package when [its components
standard](https://github.com/sympauthy/sympauthy-design/blob/main/docs/standards/components-standard.md#which-components-ship)
admits it, and stays here until then.** What stays names something of this panel: a scope, a route,
or a sentence of its bundle.

**A package's component is handed its words.** It knows no message bundle, so what it draws is a
prop filled from ours: `SaLoadingState` takes `common.loading` as its `label`, and a `SaPopover`
takes `common.moreInformation`. A word two screens hand it goes under `common.`, as [the i18n
standard](i18n-standard.md#keys) has it.

**The package knows no router.** A component drawing links is handed `RouterLink` as `link-as`, and
told which entry is current, by the wrapper that knows: `RecordTabs` and `app/layout`.

**It is installed from its git tag, `github:sympauthy/sympauthy-design#vX.Y.Z`,** and never with
`--ignore-scripts`: npm builds its `dist/` through `prepare`. Restart a running dev server after
moving the tag, since it does not watch `node_modules`.

## The kit

**The table says what to reach for, by need.** A `Sa*` component is the package's, and what
`shared/ui` publishes is [its `index.ts`](../src/shared/ui/index.ts).

| Component | Use it for |
| --- | --- |
| `CommonButton` | every [button](#buttons) |
| `ActionsDropdown` | the actions of one record or one page, and of one row when passed `record` |
| `SaSpinner` | a request in flight |
| `SaLoadingState` | the wait a screen shows while it fetches |
| `SaAlert` | a failure a screen keeps showing, or a `warning` for what is missing from one |
| `SaCard` | the white box anything on a record page is drawn in |
| `SaBrandLogo` | the deployment's logo, as [the server answers it](#the-deployments-brand) |
| `BrandWordmark` | the deployment's name |
| `SaTag` | a short status or label |
| `OriginTag` | the origin of a claim or a scope |
| `SaEmptyValue` | a field the record does not carry |
| `SaCopyableValue` | an identifier an operator has to paste elsewhere |
| `SaCopyButton` | the control that copies one |
| `OneTimeSecret` | a value the server answers once — a token, an enrolment link |
| `DocHelpTooltip` | what a domain term means, read from the bundle |
| `SaPopover` | the box it is read in, over anything that is not that sentence |
| `SaTooltip` | why a control cannot be used |
| `DocLink` | a link into the public documentation |
| `RouteLink` | a link to another screen, disabled where the token cannot open it |
| `SaField` | one labelled field of a form |
| `SaInput`, `SaSelect`, `SaTextarea` | the control inside it |
| `SaListbox` | a choice among a list whose length the deployment decides |
| `SaTagsInput` | several values, entered one at a time |
| `SaRadioGroup` | one choice among a few, all of them in sight |
| `SaDetailSection` | a titled section of a record page |
| `SaSummaryCard`, `SaSummaryField` | the panel identifying the record above its sections |
| `SaPageActions` | what the screen lets an operator do, drawn in the bar naming it |
| `SaDefinitionList`, `SaDefinitionRow` | the fields of a record, inside a section |
| `SaTableHeader`, `SaTableCell` | a column of a table, and every cell under one |
| `TableRecord` | the name of a record with a screen of its own, in a `primary` cell |
| `SaTable`, `SaPagination` | any table of records, and the pager in its `#footer` |
| `RecordTabs` | the views one record is read through |
| `SaDialog` | the shell of any dialog |
| `SaConfirmDialog` | a destructive action's confirmation |
| `SaAppShell`, `SaSidebar`, `SaSidebarAccount`, `SaBreadcrumb` | the frame, which only `app/layout` draws |

**A component that no domain vocabulary reaches belongs in `shared/ui`**, and joins
[its `index.ts`](../src/shared/ui/index.ts) in the same commit. One that names an entity belongs in
that entity's `ui/` segment — `ClaimTags`, `ClaimKindTag` — so every page draws the term the same
way.

**A component belonging to one action stays with that action**, and this table does not list it.
`CollectionPage` and the sort headers under it sit in
[`features/browse-collection`](../src/features/browse-collection) beside the state they draw,
governed by [the collection standard](collection-standard.md).

## What a screen writes

**A size or a space belongs to the component drawing it.** A page writes `fit` or `primary` and
never `px-6`, so a padding cannot drift on one screen and hold on the next. What a page arranges
itself is spaced in the steps
[Spacing](https://sympauthy.github.io/sympauthy-design/foundations/spacing) names.

**A colour is a utility of the design system's theme** — `bg-primary`, `text-gray-500`. Its `gray-*`
is the ink scale, so `ink-500` is written `text-gray-500`, and a hex value or a raw `var()` is never
written.

**A width is never written.** A column is shrink-wrapped or takes what is left, and everything else
is sized by its parent; [the page layout standard](page-layout-standard.md#table-columns) owns
which.

**A heading is drawn by the component that owns it.** `SaBreadcrumb` draws the `h1` naming the
screen, `SaDetailSection` the `h2` of a section and `SaDialog` the `h3` of a dialog; a screen outside
the panel shell, which has no bar to be named in, titles itself in `panel-screen-title`.

## Controls

**A field names its control.** Give the control an `id` and pass it to `SaField` as `for`; a
`SaListbox`, a `SaTagsInput` and a `SaRadioGroup`, which that label cannot point at, take an
`aria-label` instead.

**A control the kit does not draw is `.sa-control`.** It adds `.sa-control-focus`, or
`.sa-control-focus-within` where it is made of more than one focusable part, and `.sa-control-field`
where it takes typed text.

**What the panel draws itself and a person presses is at least `control-height`.** A link inside a
sentence is the one exception, as [Control
height](https://sympauthy.github.io/sympauthy-design/foundations/control-height) has it.

## Buttons

**A button is a `CommonButton`, and never a `SaButton`.** It takes what
[Button](https://sympauthy.github.io/sympauthy-design/components/button) takes, and adds
`requiredScopes`, which draws it refused and names what the token lacks.

**`variant="danger"` appears inside a `SaConfirmDialog` only.** What opens that confirmation is
`variant="secondary"`, or a `danger` item of an `ActionsDropdown`.

**A destructive action is confirmed by a `SaConfirmDialog`** before it reaches the API.

**`variant="primary"` is the one action a collection's toolbar or a dialog exists for.** Everything
beside it is `variant="secondary"`, so a filled button is never repeated down a table.

**A table row holds no button.** What can be done to it is a menu drawn as its mark, and the way into
it is its name, as [the page layout standard](page-layout-standard.md#table-rows) has it. A control
of a toolbar is passed `collapseLabel` and an `icon`.

**A menu is an `ActionsDropdown`, and never a `SaMenu`.** It adds `requiredScopes` to each item, and
what those scopes do is [Authentication's](authentication.md#what-the-token-granted).

**A row's action button takes these states, from [the global
stylesheet](../src/app/styles/style.css).** It is lighter at rest than a toolbar's, since it repeats
down a column, and no page writes them.

| State | Fill | Border |
| --- | --- | --- |
| at rest | `gray-50` | `gray-200` |
| under the pointer | `gray-100` | `gray-200` |
| its menu open | `gray-100` | `gray-400` |

**The row holds `gray-50` while its menu is open.** An open menu takes the pointer from the page, so
the row's own hover cannot say which record the menu acts on.

## Overlays

**A dialog is built on `SaDialog`, and a destructive action's question on `SaConfirmDialog`.**
`SaTooltipProvider` goes once, at the root in `App.vue`, and every `SaTooltip` reads it.

**An overlay the kit cannot draw wraps a [reka-ui](https://reka-ui.com) primitive directly.** Never
hand-roll a click-outside, an Escape handler or focus management.

**That overlay is drawn from the design system's classes:** `.sa-popover` or `.sa-menu` for its box,
`.sa-menu-item` for a line of it, and `.sa-overlay-animated` for its motion.

## Text

**An identifier is the `mono` prop of the cell, field or row holding it**, and one an operator has
to paste elsewhere is a `SaCopyableValue`.

**A value the panel cannot tell an identifier from takes the body face.** A session's debug
information is a list of strings the server labelled, and an identifier among them is
indistinguishable from a date or a word; setting all of them in monospace drew that card unlike
every other record's fields, the same grant read in two faces on two screens.

**A link inside a sentence is a `DocLink`, drawing `.sa-link`.** A `RouteLink` in a table's column
is not in a sentence, and underlines on hover.

## Help

**A domain term an operator may not know carries a `DocHelpTooltip`, named by the key its
explanation nests under.** The component reads the `help` / `helpLinkText` / `helpLinkUrl` triple
from the bundle, so no screen writes the sentence or the anchor itself; `SaPopover` is the popover
alone, for what is not that sentence — the places a claim is published, listed in full.

**A help text is written for an operator meeting SympAuthy for the first time.** Say what the term
is before saying what this screen does with it: somebody who has never read the server's
documentation has to be able to act on the screen they are on.

**It names what the screen shows, never a position in it or a field of a document the panel does not
draw.** *The first four* is read against a list the popover is not beside, and `claims_supported` is
a key of the discovery document rather than anything on screen.

**It closes on `See {link} for details.`** The tooltip is the introduction and
[the public documentation](https://sympauthy.github.io) is the reference, so what that page writes
up in full is linked rather than repeated here.

**The link is a `DocLink` reaching the page covering the term, anchored at its section where it has
one** — not the site root, which leaves the operator to search for what they were already reading
about, and not the specification behind the term, which answers a question they did not ask.

**A set of states is explained state by state where one sentence cannot tell them apart.** The
`help` says what the set is and links to the documentation, and each state gets a line of its own
under it from `valuesHelp`: what it means for the record, and what tells it from its neighbours. A
grant's four statuses read that way — a sentence chaining them by semicolons left *expired* and
*lapsed* indistinguishable.

**A second explanation in one view carries the sentence alone where the documentation has nothing
further to say about it.** A field under an explained section, and a set of states a sentence spells
out in full, would both send the operator to the page the tooltip beside them already named.

**A term explained on more than one screen names the same key at each of them.** The sentence is in
the bundle once already, so a component per term would be a file that prevents no drift.

## The deployment's brand

**A deployment's brand is what the server answers under `/branding`,** so changing one is a change
of its configuration and a restart rather than a rebuild of the panel.

| Path | Reached by |
| --- | --- |
| `/branding/tokens.css` | a link in `index.html`, ahead of the app's own stylesheet |
| `/branding/icon` | a link in `index.html` |
| `/branding/logo`, `/branding/logo-dark` | `SaBrandLogo` |
| `/branding/brand.json` | `fetchBrand` in `main.ts`, once, before mounting |

**The stylesheet and the icon are linked, not fetched,** so a deployment's colours never flash
SympAuthy's first. `vite-ignore` keeps them out of the bundle and off the base path: they are the
server's, at its root.

**The name reaches a component through `useBrand`,** and is `SympAuthy` where the server configures
none. `BrandWordmark` draws it and `main.ts` titles the document with it, so neither is written
anywhere else.

**The ground under a logo chooses its file.** `SaBrandLogo` is passed `dark` on the sidebar, and
draws the light logo on `ground` and `surface` everywhere else; the device's preference has no say,
since the panel is pinned light.

**An unreadable brand draws the panel as SympAuthy's.** `fetchBrand` never rejects and gives up
after 3 seconds, `theme.css` carries the light values the stylesheet would have answered, and
`SaBrandLogo` draws the logo the package ships.

## What this standard does not cover

**Dark mode.** `data-theme="light"` on `index.html` pins the panel, whatever a deployment's
`dark-mode` says, and no screen is checked against the Dark values.

**Illustrations and empty state artwork.** An empty table is a sentence.

**A lint rule over the scale.** Prettier sorts a class list and the components own the steps, but
nothing rejects a step written by hand.

**A width below 360px.** [The page layout standard](page-layout-standard.md#the-widths-it-is-for)
names the range, and nothing under it is checked.

**An audit of the panel's own screens.** The design system's pages state the accessibility its
components answer for; what a screen assembles from them is not audited, and no target is set.

---

← [Design documentation](index.md)
