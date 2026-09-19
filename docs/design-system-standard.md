---
description: The shared interface kit — which component to reach for, the primitives the
  interactive ones wrap, and the colours, icons and text styles they are built from.
paths:
  - "src/shared/ui/**"
  - "src/**/ui/**"
---

# Design system standard

`shared/ui` is the kit every screen is assembled from. Reach for it before writing a component, and
add to it rather than beside it. [The component code standard](component-code-standard.md) says how
a component is written; this one says which to use and what it is made of.

## The kit

| Component | Use it for |
| --- | --- |
| `CommonButton` | every button, with a [style](#buttons) |
| `CommonSpinner` | a request in flight |
| `CommonAlert` | a failure the screen keeps showing |
| `Tag` | a short status or label |
| `OriginTag` | the origin of a claim or a scope |
| `CopyToClipboard` | an identifier an operator has to paste elsewhere |
| `HelpTooltip` | an explanation of a domain term |
| `DetailSection` | a titled section of a detail page |
| `ListPage` | the root of a list page |
| `PaginatedTable` | any table of records |
| `SortableHeader` | a column the list endpoint can sort on |
| `FilterBar` | the search field and the filters of a list page |
| `ActionsDropdown` | the actions of one record or one page |
| `DropdownButton` | a choice among options |
| `BaseDialog` | the shell of any dialog |
| `ConfirmDialog` | a destructive action's confirmation |

**A component that no domain vocabulary reaches belongs in `shared/ui`**, and joins
[its `index.ts`](../src/shared/ui/index.ts) in the same commit. One that names an entity belongs in
that entity's `ui/` segment — `ClaimTags`, `ClientTypeHelpTooltip` — so every page explains the term
the same way.

## Buttons

**A button is a `CommonButton` carrying one of the three styles.** `primaryColoredButton` for what
the screen is for, `secondaryColoredButton` for everything beside it, `dangerColoredButton` for what
destroys or revokes.

**A button in flight is passed `submitting`, and one waiting on its screen `loading`.** Both
disable it and draw a spinner; the label for that state comes from the matching slot.

**A destructive action is confirmed by a `ConfirmDialog`** before it reaches the API.

## Overlays

**An overlay or a menu wraps a [reka-ui](https://reka-ui.com) primitive.** The primitive brings the
focus trap, the keyboard navigation, the ARIA roles, the scroll lock and the collision-aware
positioning; the styling stays Tailwind, ours.

| Shared component | Primitive |
| --- | --- |
| `BaseDialog` | `Dialog*` |
| `ActionsDropdown`, `DropdownButton` | `DropdownMenu*` |
| `HelpTooltip` | `Popover*` |
| `PaginatedTable`'s footer | `Pagination*` |

**Never hand-roll a click-outside, an Escape handler or focus management.** Reach for the primitive
that already has it.

**A dialog is built on `BaseDialog`.** It supplies the overlay, the centred card, the `h3` title and
the fade, and it is controlled by `:open` plus `@close` — reka-ui emits a close on a user dismissal
only, so a parent closing it programmatically never fires a second one.

**A state a primitive exposes is styled through its data attribute.** `data-[highlighted]:` covers
both hover and keyboard focus on a menu item, and `data-[selected]:` marks the current page in the
pagination bar.

## Colour

**A colour that a deployment could want to change is a CSS variable**, declared in
[the global stylesheet](../src/app/styles/style.css) and used as `bg-(--color-primary)` or
`text-(--color-on-primary)`.

**Everything else comes from Tailwind's palette**, and the same role keeps the same shade: `gray-50`
behind a table header, `gray-200` for a border, `gray-500` for a label, `gray-900` for a value,
`red-50`/`red-700` for an inline error box, `amber-50`/`amber-800` for a warning an operator must
read before closing a dialog.

**A `Tag` picks its colour from the meaning, not the palette.** Green for what is enabled, red for
what is not, yellow for what needs attention, purple and blue for a classification, gray for the
rest.

## Icons

**An icon comes from `@heroicons/vue/20/solid`,** imported by name where it is used.

**An icon inside a button is `size-4 shrink-0`, and the label beside it is `hidden sm:inline`.** A
phone shows the icon alone, and the button keeps its meaning through its `title`.

## Text

**A heading is styled by the component that owns it.** `DetailSection` draws the `h2` of a section
and `BaseDialog` the `h3` of a dialog, so neither is written by hand.

**A label above a value is `text-xs font-medium text-gray-500 uppercase tracking-wider`,** in a
summary panel and in a definition list alike.

**An identifier is `font-mono`**, and one an operator has to paste elsewhere carries a
`CopyToClipboard` beside it.

## Help

**A domain term an operator may not know carries a `HelpTooltip`.** Its text lives in the bundle
with the `help` / `helpLinkText` / `helpLinkUrl` triple, and the link points at the
[public documentation](https://sympauthy.github.io).

**A term explained on more than one screen becomes a component in its entity's `ui/` segment**, so
the explanation cannot drift between two screens.

## What this standard does not cover

**Dark mode and per-deployment theming.** The variables exist, nothing switches them, and no screen
is checked against a second palette.

**Toasts and notifications.** Nothing reports success out of band; a screen shows the result it
asked for.

**Illustrations and empty state artwork.** An empty table is a sentence.

**Accessibility beyond what the primitives bring.** Nothing is audited, and no target is set.

---

← [Design documentation](index.md)
