---
description: The shared interface kit — which component to reach for, the scale its sizes and
  spaces come from, the primitives the interactive ones wrap, and the colours, icons and text
  styles they are built from.
paths:
  - "src/**/ui/**"
  - "src/features/*/ui/**"
  - "src/app/styles/**"
---

# Design system standard

`shared/ui` is the kit every screen is assembled from. Reach for it before writing a component, and
add to it rather than beside it. [The component code standard](component-code-standard.md) says how
a component is written; this one says which to use and what it is made of.

## The kit

**What `shared/ui` publishes is [its `index.ts`](../src/shared/ui/index.ts).** The table says what
to reach for, by need.

| Component | Use it for |
| --- | --- |
| `CommonButton` | every button, with a [style](#buttons) |
| `CommonSpinner` | a request in flight |
| `LoadingState` | the wait a screen shows while it fetches |
| `CommonAlert` | a failure a screen keeps showing, or a `warning` for what is missing from one |
| `CommonCard` | the white box anything on a record page is drawn in |
| `CommonTag` | a short status or label |
| `OriginTag` | the origin of a claim or a scope |
| `EmptyValue` | a field the record does not carry |
| `CopyableValue` | an identifier an operator has to paste elsewhere |
| `CopyToClipboard` | the control that copies one |
| `OneTimeSecret` | a value the server answers once — a token, an enrolment link |
| `DocHelpTooltip` | what a domain term means, read from the bundle |
| `HelpTooltip` | the popover it is read in, over anything that is not that sentence |
| `DocLink` | a link into the public documentation |
| `FormField` | one labelled field of a form |
| `FormInput`, `FormSelect`, `FormTextarea` | the control inside it |
| `FormListbox` | a choice among a list whose length the deployment decides |
| `FormTagsInput` | several values, entered one at a time |
| `DetailSection` | a titled section of a record page |
| `SummaryCard`, `SummaryField` | the panel identifying the record above its sections |
| `PageActions` | what the screen lets an operator do, drawn in its header |
| `DefinitionList`, `DefinitionRow` | the fields of a record, inside a section |
| `TableHeader`, `TableCell` | a column of a table, and every cell under one |
| `PaginatedTable` | any table of records |
| `RecordTabs` | the views one record is read through |
| `ActionsDropdown` | the actions of one record or one page |
| `BaseDialog` | the shell of any dialog |
| `ConfirmDialog` | a destructive action's confirmation |

**A component that no domain vocabulary reaches belongs in `shared/ui`**, and joins
[its `index.ts`](../src/shared/ui/index.ts) in the same commit. One that names an entity belongs in
that entity's `ui/` segment — `ClaimTags`, `ClaimKindTag` — so every page draws the term the same
way.

**A component belonging to one action stays with that action**, and this table does not list it.
`CollectionPage` and the toolbar, the filters and the sort headers under it sit in
[`features/browse-collection`](../src/features/browse-collection) beside the state they draw,
governed by [the collection standard](collection-standard.md). The scale, the colours and the
primitives below are still what they are built from.

## The scale

**A size or a space is a step of this scale, and a component owns which step it takes.** A page
writes `fit` or `primary` and never `px-6`, so a padding cannot drift on one screen and hold on the
next.

**A layout is spaced in `1`, `2`, `3`, `4` or `6`, and nothing else.** A half-step — `0.5`, `1.5`,
`2.5` — appears only inside a control's own padding, where it centres a line of text.

| Step | Between |
| --- | --- |
| `gap-1.5` | a control and the icon inside it |
| `gap-1` | two tags |
| `gap-2` | two controls in a row |
| `gap-3` | two buttons in a dialog's footer |
| `gap-4`, `space-y-4` | two blocks of one screen |
| `space-y-6` | two sections of a record |
| `p-4 sm:p-6` | a card and its content |
| `px-4 py-3 sm:px-6` | a definition row and its label |
| `px-6 py-4` | a table cell, `py-3` in a header |
| `p-4`, `gap-3` inside | a record's card, below `sm:`, and its lines |

**Text is `text-xs`, `text-sm`, `text-lg` or `text-2xl`.** A label and a tag are `text-xs`;
everything an operator reads is `text-sm`; `text-lg font-semibold` heads a section or a dialog; and
`text-2xl font-bold` the title of a screen drawn outside the panel shell, which has no bar to be
named in.

**An icon matches the text beside it** — `size-4` in a control, a cell or a menu, `size-3` beside a
`text-xs` label, `size-5` and `size-6` for the sidebar's own affordances. Write `size-*`, never
`h-4 w-4`.

**A radius says what the thing is**: `rounded-md` for a control, a button, a menu or an alert,
`rounded-lg` for a card, a dialog or a popover, `rounded-full` for a tag or a spinner. Never bare
`rounded`.

**A width is never written.** A column is shrink-wrapped or takes what is left
([the page layout standard](page-layout-standard.md#table-columns) owns which), and everything else
is sized by its parent.

**The one width that is written is `--container-page`**, where a screen stops growing and starts
centring. [The page layout standard](page-layout-standard.md#the-widths-it-is-for) says what range
the panel is built for.

## Controls

**A control is `.control`,** declared in [the global stylesheet](../src/app/styles/style.css). An
input, a select, a textarea, a button and a dropdown trigger share that rule, so a row of them is
one height whatever each is made of.

**That height is stated, not inherited from the content.** `.control` carries a `min-h`, because a
button laying its label out as a line box is a descender taller than one laying it out as a flex
row, and an icon with the label collapsed is shorter than either. **A control holding more than
text centres it** — `flex items-center` — so what the height gains does not sit at the top of it.

**A control that takes focus adds `.control-focus`**, which is the panel's one focus ring.

**A control made of more than one focusable part adds `.control-focus-within` instead.** The box
shows the focus its children take, so a collection's filter — the trigger reading it and the control
removing it, inside one box — marks itself whichever of the two an operator reached.

**A field of a form is a `FormField` wrapping a `FormInput`, `FormSelect` or `FormTextarea`.** The
field owns the label and the space under it; the control owns the box.

**A list the build knows the length of is a `FormSelect`, and one the deployment sizes a
`FormListbox`.** A select renders every option it is handed, which is a menu taller than the screen
once the set is a deployment's claims; the listbox scrolls and grows a search field past
`SEARCHED_FROM`.

**A control that reads a value character by character is passed `mono`** — a token, an identifier, a
JSON document.

## Buttons

**A button is a `CommonButton` carrying one of the three styles.** `primaryColoredButton` for what
the screen is for, `secondaryColoredButton` for everything beside it, `dangerColoredButton` for what
destroys or revokes.

**A button's text is its `label` prop, not its slot.** The prop is what the button in flight keeps
showing and what its `title` carries, so the same string is never written twice.

**An icon on a button is its `icon` prop, and one that opens something its `trailingIcon`.** Both
are drawn `size-4 shrink-0` by the button.

**A button inside a table row keeps its label at every supported width.** Below `sm:` that row is
a card, which has the width the label needs.

**A control of a toolbar is passed `collapseLabel`**, which leaves its icon alone below `sm:` and
keeps the label as a title. A toolbar is one row of controls whatever the width, and two labelled
ones do not fit a phone beside each other. Pass an `icon` with it, or there is nothing left to
press.

**A button in flight is passed `submitting`, and one waiting on its screen `loading`.** Both disable
it and draw a spinner; the label stays unless a `#submitting` or `#loading` slot overrides it.

**A destructive action is confirmed by a `ConfirmDialog`** before it reaches the API.

## Overlays

**An overlay or a menu wraps a [reka-ui](https://reka-ui.com) primitive.** The primitive brings the
focus trap, the keyboard navigation, the ARIA roles, the scroll lock and the collision-aware
positioning; the styling stays Tailwind, ours.

| Shared component | Primitive |
| --- | --- |
| `BaseDialog` | `Dialog*` |
| `ActionsDropdown` | `DropdownMenu*` |
| `HelpTooltip`, a collection's filter and its field list | `Popover*` |
| `HintTooltip` | `Tooltip*` |
| `FormListbox` | `Listbox*` |
| `FormTagsInput` | `TagsInput*` |
| `PaginatedTable`'s footer | `Pagination*` |

**Never hand-roll a click-outside, an Escape handler or focus management.** Reach for the primitive
that already has it.

**A dialog is built on `BaseDialog`.** It supplies the overlay, the centred card, the `h3` title,
the fade and the `#actions` footer its buttons sit in, and it is controlled by `:open` plus
`@close` — reka-ui emits a close on a user dismissal only, so a parent closing it programmatically
never fires a second one.

**A menu an overlay drops is `.menu`, and a line of it `.menu-item`.** Both are in the global
stylesheet, so a record's actions and a collection's fields read as the same list. A `FormListbox`
takes the line and not the box: it is a control, and draws the one every control shares.

**A control that cannot be used is disabled, not removed, and says why.** A menu item drops its
colour for `gray-400` and the pointer for `cursor-not-allowed`, and writes the reason under its
label: a menu is read while it is open, and a hover over one of its items is a highlight rather
than a question; an option of a dialog does the same. A button, a sidebar entry and a link carry
the reason in a `HintTooltip`, opened by the pointer, the keyboard or a tap. The control is the
tooltip's trigger, so it is marked `aria-disabled` rather than `disabled` — it keeps the focus and
the pointer a disabled element refuses, and drops its own action instead. Never a `title` alone:
the browser shows it late, and never on a touch screen.
[Authentication](authentication.md#what-the-token-granted) says when a control is disabled.

**A `HintTooltip` is a sentence about the control under it, and a `HelpTooltip` a term's
explanation.** One opens on hover and focus over the control itself and carries no link; the other
is pressed open from an ⓘ and may close on one, so the two are never interchanged.

**A menu's destructive items are set apart by a `gray-200` rule**, which `ActionsDropdown` draws
before the first of them; [the page layout standard](page-layout-standard.md#menus) says why they
come last.

**A surface an overlay asks or explains something on is `.popover`.** The help behind a domain term
and the box a filter's operator and value are filled in from are one box, and it takes a card's
radius rather than a menu's.

**An overlay animates through `.overlay-animated`**, which is the panel's one motion. A dialog is
the exception it states itself: its content is centred by a transform an animated one would undo.

**A state a primitive exposes is styled through its data attribute.** `data-[highlighted]:` covers
both hover and keyboard focus on a menu item, and `data-[selected]:` marks the current page in the
pagination bar.

## Colour

**A colour a deployment could want to change is declared to Tailwind in `@theme`**, in
[the global stylesheet](../src/app/styles/style.css), and reached as a generated utility —
`bg-primary`, `text-on-primary`, `ring-primary`. Nothing writes a raw `var()`.

**Everything else comes from Tailwind's palette**, and the same role keeps the same shade: `gray-50`
behind a table header, `gray-200` for a border, `gray-300` for a value a record does not carry,
`gray-500` for a label and a secondary cell, `gray-900` for the column identifying a record.

**A message box is a `CommonAlert`**, `red-200`/`red-50`/`red-700` for a failure and
`amber-200`/`amber-50`/`amber-800` for what an operator has to read before closing a dialog. No
screen draws its own.

**A `CommonTag` picks its colour from the meaning, not the palette.** Green for what is enabled,
red for what is not, yellow for what needs attention, purple and blue for a classification, gray
for the rest.

## Icons

**An icon comes from `@heroicons/vue/20/solid`,** imported by name where it is used.

**An icon inside a button reaches it as the `icon` prop** rather than as markup, so its size and the
gap beside it are the button's to decide.

## Text

**A heading is styled by the component that owns it.** `DetailSection` draws the `h2` of a section
and `BaseDialog` the `h3` of a dialog, so neither is written by hand.

**A label above a value is `.field-label`.** `TableHeader`, `SummaryField` and `DefinitionRow` draw
one, and a stacked `TableCell` grows one from its `label`; a fifth place needing one reaches for
whichever of them fits.

**An identifier is `font-mono`**, reached as the `mono` prop of the cell, field or row holding it,
and one an operator has to paste elsewhere is a `CopyableValue`.

**A value the panel cannot tell an identifier from takes the body face.** A session's debug
information is a list of strings the server labelled, and an identifier among them is
indistinguishable from a date or a word; setting all of them in monospace drew that card unlike
every other record's fields, the same grant read in two faces on two screens.

**A field the record does not carry is an `EmptyValue`.** It drops back to the body face, so a dash
beside a monospace value does not read as part of that value.

## Help

**A domain term an operator may not know carries a `DocHelpTooltip`, named by the key its
explanation nests under.** The component reads the `help` / `helpLinkText` / `helpLinkUrl` triple
from the bundle, so no screen writes the sentence or the anchor itself; `HelpTooltip` is the popover
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

## What this standard does not cover

**Dark mode and per-deployment theming.** The `@theme` block is the one place a palette would be
swapped, nothing switches it, and no screen is checked against a second one.

**Toasts and notifications.** Nothing reports success out of band; a screen shows the result it
asked for.

**Illustrations and empty state artwork.** An empty table is a sentence.

**Labels bound to their controls.** `FormField` draws a `<label>` and no `for`, because nothing here
issues the identifiers one would point at.

**A lint rule over the scale.** Prettier sorts a class list and the components own the steps, but
nothing rejects a step written by hand.

**A width below 360px.** [The page layout standard](page-layout-standard.md#the-widths-it-is-for)
names the range, and nothing under it is checked.

**Accessibility beyond what the primitives bring.** Nothing is audited, and no target is set.

---

← [Design documentation](index.md)
