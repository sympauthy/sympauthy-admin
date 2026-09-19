---
description: How a Vue component is written — the shape of the file, its props, emits and slots,
  where its state lives, and how a form is handled.
paths:
  - "src/**/*.vue"
---

# Component code standard

Every component is a single file component with a `<script lang="ts" setup>` block.
[The design system standard](design-system-standard.md) says which component to reach for before
writing one, and [the page layout standard](page-layout-standard.md) what a page assembles them
into.

## Shape of the file

**A file holds `<script lang="ts" setup>`, then `<template>`, then `<style scoped>` if it needs
one.** Nothing else, and in that order.

**A `<style scoped>` block holds only what a utility class cannot express** — a keyframe, an
animation keyed on a `data-state` attribute. Everything else is Tailwind in the template, and a rule
that has to hold for every screen goes in [the global
stylesheet](../src/app/styles/style.css).

**A component's file name is its name, in PascalCase, and multi-word.** ESLint enforces the
multi-word part, and a component is written in PascalCase in a template.

## Props

**Props are declared as a type, never as an object.** Two or three props are written inline; a
longer list is an `interface Props` above the call.

```ts
const props = withDefaults(defineProps<{ loading?: boolean; error?: string | null }>(), {
  loading: false,
  error: null
})
```

**An optional prop is given its default through `withDefaults`.** An array or object default is a
factory — `filters: () => []`.

**A prop whose use is not obvious carries a TSDoc line above it.** Say when a caller should set it,
not what its type already says.

**A prop is read, never written.** What a child changes, it emits.

## Emits

**Emits are declared as a type, with a tuple per event.** `defineEmits<{ close: []; pageChange:
[page: number] }>()`.

**An event is named in camelCase where it is declared, and in kebab-case where it is listened to.**
`pageSizeChange` becomes `@page-size-change`.

**An event says what happened, not what to do about it.** `search`, `confirm`, `created`, `close` —
the parent decides the consequence.

## Slots

**A wrapper forwards the slots it wraps, by name.** `ListPage` forwards `header`, `rows` and
`empty`, so a page fills a table it never renders itself.

**A slot that changes the layout when it is filled is read through `useSlots()`.** The toolbar of a
list page exists because `slots.actions` is defined, and the title of a dialog because `slots.title`
is.

## State

**Local state is a `ref`, and anything derived from it is a `computed`.** Reach for a `watch` only
for what neither can express — resetting a dialog's fields when it opens, redirecting when a
session is lost.

**A panel reads the store it displays; a shared or entity component takes what it displays as
props.** `UserClaimsPanel` calls `useUserDetailStore()` itself; `UserSummaryPanel` receives the user
it renders.

**The parent owns whether a dialog is open.** It holds the flag, passes it as `:open` and clears it
on `@close`; the dialog never closes itself.

**A first fetch happens in `onMounted`.** A detail page resets its stores there before fetching, so
a second visit never renders the previous record.

## Rendering

**Loading, error and content are one `v-if` / `v-else-if` / `v-else` chain**, in that order, and
each is marked with a comment naming the state.

**A `v-for` always carries a `:key`**, and the key is the record's own identifier where it has one.

**A template holds no logic beyond a call.** A condition worth a name is a `computed`, and a handler
worth branching is a function in the script block.

## Forms

**A form is local state: a `ref` per field, a `submitting` ref and an `error` ref.** There is no
form library, and a dialog reset happens in the `watch` on its `open` prop.

**A field is validated in the submit handler, and the first failure sets `error` and returns.** The
message comes from the bundle, like every other string.

**A dialog blocks its own dismissal while a request is in flight** by passing `submitting` as
`dismiss-disabled`, so an Escape key does not leave a half-finished action behind.

**A failed call fills `error` from `getErrorMessage`,** and a per-field failure from
`getErrorMessageForProperties`. [The API standard](api-standard.md) owns both.

## What this standard does not cover

**Tests and component stories.** Neither exists in the repository.

**Global registration.** Every component is imported where it is used.

**Render functions and JSX.** Nothing uses either.

**Transitions between routes.** Only overlays animate, through their own keyframes.

---

← [Design documentation](index.md)
