---
description: Where a string an operator reads comes from — the bundle, how a key is named, and how
  it reaches the screen.
paths:
  - "src/shared/i18n/**"
  - "src/**/ui/**"
---

# Internationalization standard

Every string an operator reads comes from a bundle. A screen holds keys, and
[`shared/i18n`](../src/shared/i18n) resolves them against the language the operator chose, or the
one their browser asks for.

## The bundle

**A locale is one JSON file under [`locales/`](../src/shared/i18n/locales).** The plugin compiles
what is there at build time, so adding a language is adding a file and nothing else.

**`en.json` is the source of truth and the fallback.** A key missing from another locale resolves to
the English string, and a key missing everywhere resolves to itself.

**The locale is the language the operator chose on the preferences page, or the browser's**, with
`en` behind it. `setLanguage` applies it, from the next render on and without a reload.

**The languages offered are `availableLanguages()`, each named in itself.** It answers the bundles
there are, so a bundle added is an entry added with nothing else to change, and an operator who
cannot read the panel's current language still finds their own.

**`currentLocale()` is what a request asks the server to answer in**, and it answers the locale a
bundle exists for rather than the one the browser asked for. A screen rendered from `en.json`
through the fallback must not carry field names the server wrote in another language.

## Keys

**A screen's strings live under `pages.<route name>`.** The segment is the route's name, so
`pages.userDetail` belongs to the `userDetail` route and to nothing else.

**A string two screens show goes under `common.`** — an action, a state, a unit of the table
furniture. A label written twice under two pages is one translation that will drift.

**A word of the server's own vocabulary goes under `terms.`** — what a claim's kind is, what an
audience's registration mode means, the values either of them publishes. A term one screen alone
explains stays under that screen's `pages.<route>`, so `terms.` never becomes a second home for a
page's labels.

**A value the server publishes is translated under `terms.<set>.values.<value>`.** The origin of a
claim, the status of a session, the purpose of an interactive flow: the key is the value the API
sent, so a component translates without a mapping of its own.

**The `values` segment is what keeps a set's own keys off its values.** The `label` a column is read
under, the `help` explaining it and a set nested beside it all sit on the set itself, and nothing
there can be mistaken for a value the server might send.

**A value explained on its own nests under `terms.<set>.valuesHelp.<value>`**, beside the `values`
naming it. It is for a set whose states one sentence cannot tell apart, and
[`DocHelpTooltip`](design-system-standard.md#help) lists every one of them under the set's `help`.

**A set belonging to one entity nests under that entity, and a set two of them publish stands on its
own.** `terms.claim.kind.values.<value>` and `terms.interactiveFlowSession.status.values.<value>`
against `terms.origin.values.<value>`, which both a claim and a scope have.

**A name the server sends in the reader's language is rendered as it arrived.** A capability
document names every field it publishes and every value a closed set holds, and those sets are the
deployment's own — the bundle could not hold them and must not try.

**A sentence the server rendered is shown as it arrived, and an identifier it is shown beside stays
an identifier.** Both come from the server's own error bundle of hundreds of codes: resolving one of
those codes against `en.json` here would be a second copy of that bundle, and the copy that drifts.

**A field carrying an explanation nests as `label` and `help` under the key it is read by**, so
`pages.sessionFailure.errorDetails.label` names the field and `.help` is what its `SaPopover`
says. A field explaining itself is the exception; a screen whose fields need no help keeps its flat
string per key.

**A label two screens share keeps its explanation under each of them** where what it explains
differs. `terms.origin.label` names a column on the claims screen and on the scopes screen, and
`pages.claims.origin.help` beside `pages.scopes.origin.help` are the two sets of values and the two
pages of documentation behind it.

**A word the protocol fixes is the panel's to name.** The ten collection operators are closed and
deliberately unlocalized on the wire, so `common.operators.<operator>` holds their labels, with
`common.operators.date.<operator>` overriding the comparisons that read differently over a moment.
They carry no `values` segment, because the set is the protocol's rather than the server's: nothing
is ever added to it that the nested `date` could be mistaken for.

**A term belonging to one entity lives under `terms.<entity>.<term>`,** whichever screens explain
it: `terms.claim.identifier`, `terms.client.type`, `terms.audience.registrationMode`.

**A dialog reused by several screens takes a top-level key named after it.** `logoutDialog`.

**An error code is a key.** The server's `error_code` names the message, and the panel's own two are
`api.unknown` and `api.unauthorized`; [the API standard](api-standard.md) owns where they come from.

**A key joins `en.json` in the commit that adds the component reading it**, in the object of the
screen that reads it.

## Writing a string

**A component reads `const { t } = useI18n()`.** Code outside a component calls `translateMessage`,
and code holding a label the server supplied calls `translateMessageOr`, which keeps that label when
the panel has no translation for it.

**The instance is built in the Composition API mode, and that call takes no arguments.** A
no-argument `useI18n()` resolves to the global scope, which is where the bundle is; `messages` or
`useScope: 'local'` passed to it would give that component a scope of its own, holding what it was
passed and nothing of `en.json`. The mode is what decides that, and it is the one vue-i18n 12
leaves — the legacy mode is removed there.

**A value is interpolated by name**, written `{name}` in the bundle and passed as an object:
`t('common.pagination', { page, totalPages })`.

**A string carrying a link is rendered with `<i18n-t>`,** the link supplied as a named slot:

```html
<i18n-t :keypath="keypath" tag="p" scope="global">
  <template #link><DocLink :href="linkUrl">{{ linkText }}</DocLink></template>
</i18n-t>
```

**It names `scope="global"`,** since it resolves against its parent's scope otherwise and no
component here declares one. The bundle it reaches is the global one either way — the attribute is
what stops it searching a chain of components for a scope that does not exist.

**An explanation and its link are the triple `help`, `helpLinkText`, `helpLinkUrl`,** so the URL is
translatable with the sentence around it. `DocHelpTooltip` renders the three from the key they nest
under, and [the design system standard](design-system-standard.md#help) says what the sentence has
to say.

**A template holds no literal a person reads.** The product name is the exception: `SympAuthy Admin`
is written as it is.

## Dates

**A date is written by `formatDate`, `formatDateTime` or `formatTime`,** in the date format and the
zone the operator chose. Each reads them during the render, so a screen is drawn again when they
change.

**ISO 8601 is the default format, written `2026-11-11 14:03` on a 24-hour clock, and a time alone
`14:03:12`.** It reads the same in every language and on every operator's screen, and a time alone
is read beside the others of its day, which one minute does not tell apart.

**The language's own format is the one of `requestedLocale()`**, the language asked for rather than
the bundle answering it, so a French browser reading the English bundle keeps French dates.

**A time in a zone other than the browser's names that zone after it.** A time read in UTC is then
never taken for a local one. A day alone names none.

## What this standard does not cover

**Which languages ship.** English is the only bundle today, and adding one changes nothing here.

**Translation tooling.** The bundle is edited by hand in this repository.

**Pluralization beyond English.** A count's key holds two forms joined by ` | `, singular then
plural, which is English's rule; a language with more forms waits for a second bundle.

**Formatting a number or a duration.** Each is written as the browser writes it, in whatever the
bundle's language is.

**Right-to-left layouts.** Nothing is mirrored, and no screen is checked in one.

---

← [Design documentation](index.md)
