---
description: Where a string an operator reads comes from — the bundle, how a key is named, and how
  it reaches the screen.
paths:
  - "src/shared/i18n/**"
---

# Internationalization standard

Every string an operator reads comes from a bundle. A screen holds keys, and
[`shared/i18n`](../src/shared/i18n) resolves them against the locale their browser asks for.

## The bundle

**A locale is one JSON file under [`locales/`](../src/shared/i18n/locales).** The plugin compiles
what is there at build time, so adding a language is adding a file and nothing else.

**`en.json` is the source of truth and the fallback.** A key missing from another locale resolves to
the English string, and a key missing everywhere resolves to itself.

**The locale comes from the browser**, with `en` behind it. Nothing lets an operator pick another
one.

## Keys

**A screen's strings live under `pages.<route name>`.** The segment is the route's name, so
`pages.userDetail` belongs to the `userDetail` route and to nothing else.

**A string two screens show goes under `common.`** — an action, a state, a unit of the table
furniture. A label written twice under two pages is one translation that will drift.

**A value the server publishes is translated under `common.<set>.<value>`.** The origin of a claim,
the status of a session, the purpose of an interactive flow: the key is the value the API sent, so a
component translates without a mapping of its own.

**A term belonging to one entity lives under `<entity>.<term>`,** beside the component explaining
it: `claim.identifier`, `client.type`.

**A dialog reused by several screens takes a top-level key named after it.** `logoutDialog`.

**An error code is a key.** The server's `error_code` names the message, and the panel's own two are
`api.unknown` and `api.unauthorized`; [the API standard](api-standard.md) owns where they come from.

**A key joins `en.json` in the commit that adds the component reading it**, in the object of the
screen that reads it.

## Writing a string

**A component reads `const { t } = useI18n()`.** Code outside a component calls `translateMessage`,
and code holding a label the server supplied calls `translateMessageOr`, which keeps that label when
the panel has no translation for it.

**A value is interpolated by name**, written `{name}` in the bundle and passed as an object:
`t('common.pagination', { page, totalPages })`.

**A string carrying a link is rendered with `<i18n-t>`,** the link supplied as a named slot:

```html
<i18n-t keypath="claim.identifier.help" tag="p">
  <template #link><a :href="t('claim.identifier.helpLinkUrl')">…</a></template>
</i18n-t>
```

**An explanation and its link are the triple `help`, `helpLinkText`, `helpLinkUrl`,** so the URL is
translatable with the sentence around it.

**A template holds no literal a person reads.** The product name is the exception: `SympAuthy Admin`
is written as it is.

## What this standard does not cover

**Which languages ship.** English is the only bundle today, and adding one changes nothing here.

**Translation tooling.** The bundle is edited by hand in this repository.

**Pluralization.** No key has a plural form, and nothing picks between two.

**Formatting a date, a number or a duration.** `formatDate` and `formatDateTime` defer to the
browser's locale, which is not the one the bundle was picked with.

**Right-to-left layouts.** Nothing is mirrored, and no screen is checked in one.

---

← [Design documentation](index.md)
