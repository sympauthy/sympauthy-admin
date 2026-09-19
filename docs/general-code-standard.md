---
description: What a slice is made of, what may import what, and the naming, typing and comment
  rules that hold everywhere in `src/`.
paths:
  - "src/**"
---

# General code standard

[Architecture](architecture.md) says what the layers are and why the structure is checked. This
document says what a slice is made of and what holds across all of them. What each kind of file does
with itself is a standard per subject:

| Standard | Covers |
| --- | --- |
| [Components](component-code-standard.md) | how a `.vue` file is written |
| [Design system](design-system-standard.md) | which shared component to reach for, and the tokens |
| [Page layout](page-layout-standard.md) | list pages, detail pages, and how each adapts to width |
| [API](api-standard.md) | clients, resources, schemas, and what a call resolves to |
| [Stores](store-standard.md) | what a Pinia store holds and exposes |
| [Internationalization](i18n-standard.md) | the bundle, and how a key is named |

## What a slice is made of

| Segment | Component | Name | Owns |
| --- | --- | --- | --- |
| `api/` | client | `…Api` | the calls to one server surface |
| `model/` | resource | `…Resource`, `…ListResource` | one response body, as TypeScript |
| `model/` | schema | `…ResourceSchema` | the AJV schema validating that body |
| `model/` | store | `use…Store` | the state one screen or panel reads |
| `model/` | helper | a verb or a noun phrase | a rule over a resource |
| `ui/` | component | `…Page.vue`, `…Panel.vue`, `…Dialog.vue`, `…Tooltip.vue` | what is rendered |

**A slice is built from the segments it needs, and no others.** An entity with nothing to render has
no `ui/`, and a page with no state of its own has no `model/`.

**A file fitting none of the rows above is a change to this table before it is a file.**

## Imports

**Another slice is imported through its public API, by the `@` alias.** `@` resolves to `src/`, and
the path stops at the slice: `@/entities/user`, `@/shared/ui`, `@/features/logout-user`.

**A file inside a slice is imported by relative path.** `./UserClaimsPanel.vue`, `../api/UserApi`.

**A slice's `index.ts` re-exports what other slices may use, and nothing else.** An entity publishes
its clients, its resources, its schemas and its stores; a page publishes only its route component.
[Architecture](architecture.md#the-public-api-of-a-slice) argues why.

**A new export joins the slice's `index.ts` in the same commit that adds it.** A file another slice
cannot reach is a file inside this one.

**Two slices on the same layer never import each other.** An entity that genuinely nests another
publishes an `@x/<consumer>.ts` naming exactly what that consumer may use, and the consumer imports
`@/entities/<owner>/@x/<consumer>`.

## Naming

**A name is prefixed by the entity it belongs to when the bare name is already taken by another
entity.** A claim the server is configured with is a `ClaimResource`; a value collected for a person
is a `UserClaimResource`, and its store is `useUserConsentStore` rather than `useConsentStore`.

**The prefix is the entity's full name, spelled as the API spells it.** An interactive flow session
is `InteractiveFlowSession…` throughout — the resources, the client, and the stores — and `session`
only as the slice folder.

**A file exporting one thing is named after it.** `UserApi.ts`, `useUserStore.ts`,
`UserSummaryPanel.vue`. A file exporting several small ones is named after what they have in common,
with a `…Utils` suffix for a module of pure functions: `DateUtils.ts`, `StringUtils.ts`.

**A composable is named `use…` and returns an object.** It lives in `shared/lib` when it knows no
domain, and in a slice's `model/` when it does.

**A helper over a resource lives in the file declaring that resource**, next to the type it reads —
`userIdentifierLabel` sits under `UserResource`. A helper reading no resource is a pure function in
`shared/lib`.

## Types

**A response body is a `type`.** It mirrors the JSON the server sends, field for field, in the
server's own spelling; [the API standard](api-standard.md) owns what that means.

**Everything else the code shapes is an `interface`** — a component's props, a call's parameters, an
options bag.

**A value the code has not yet checked may be `any`.** Parsed JSON before its schema has run, and a
caught error, are the cases; anything past that boundary carries its type. The ESLint rule is off
because of them, not as a licence.

**A narrowing helper is a type predicate.** `isSuccess(response)`, `isStringNotEmpty(value)` — the
call site gets the narrowed type rather than a boolean it has to act on twice.

## Comments

**A comment says why, and the code says what.** The measurement that would oscillate, the request
that must not be sent twice, the field the server may omit — write the reason a reader would
otherwise remove.

**An exported function, type or component with a non-obvious use carries a TSDoc block.** State what
it is for, and what a caller has to hold true.

**A prop whose use is not obvious carries a TSDoc line above it**, inside the props type.

**A departure from a standard is commented where it departs**, with the reason. A second case
falling under the same reason makes it a rule, in the standard that owns the subject.

## Mechanics

**Prettier decides formatting, and `npm run format` applies it.** No semicolons, single quotes, two
spaces, 100 columns, no trailing comma — none of which is worth hand-holding, and CI checks it.

**A component name is multi-word.** ESLint enforces it, and its `ignores` list is what the exception
looks like.

**A change passes `npm run lint`, `npm run lint:arch`, `npm run format` and `npm run build`.** CI
runs ESLint, Steiger, `prettier --check` and the build, which type-checks as it goes — so the
formatter is the one easily skipped and the one that fails a pull request.

## What this standard does not cover

**Tests.** No framework is configured and nothing in the repository runs one.

**Accessibility.** What the reka-ui primitives bring is what the panel has; nothing is audited and
no target is set.

**Logging and error reporting.** A failure is a `console.error` and a message on screen, and nothing
is collected anywhere.

**Bundle size and performance.** Nothing is measured, budgeted or code-split beyond what Vite does
on its own.

---

← [Design documentation](index.md)
