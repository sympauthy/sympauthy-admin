# Technology

What the panel is built on, and why each piece was picked. The versions that ship are
[`package.json`](../package.json); this document says what each dependency is there for.

## The application

**[Vue 3](https://vuejs.org), Composition API, `<script setup>`.** The same framework as the
[interactive flow application](https://github.com/sympauthy/sympauthy-flow), so a person moving
between the two repositories reads the same kind of component.

**[Vite](https://vite.dev).** The dev server proxies `/api` and `/.well-known` to a SympAuthy
running on `localhost:8080`, which is what lets the panel be developed against a real server without
CORS or a second origin. The production build is static assets the server serves itself.

**[TypeScript](https://www.typescriptlang.org).** The server's JSON is the contract this panel is
written against, and a resource type is how that contract is stated in the source.

**[Vue Router](https://router.vuejs.org).** One route per screen, with the authentication guard and
the breadcrumb hierarchy carried in the route's `meta`.

**[Pinia](https://pinia.vuejs.org).** A store per concern holds what a screen displays, so a panel
and the dialog acting on it read the same state without passing it through props.

**[AJV](https://ajv.js.org).** Every response is validated against the schema declared beside its
resource type, so a contract that drifted is a logged error at the boundary rather than an undefined
field rendered three components deeper.

**[oidc-client-ts](https://github.com/authts/oidc-client-ts).** The panel is an ordinary public
client of the server it administers: authorization code with PKCE, silent renew, and DPoP-bound
codes, none of which is worth reimplementing.

## The interface

**[Tailwind CSS 4](https://tailwindcss.com).** Utility classes in the template, with the deployment
colours declared as CSS variables in [`src/app/styles/style.css`](../src/app/styles/style.css).

**[reka-ui](https://reka-ui.com).** Headless primitives supply the behaviour nobody should hand-roll
— focus trap, keyboard navigation, ARIA roles, scroll lock, collision-aware positioning — while all
styling stays ours. [The design system standard](design-system-standard.md) says which primitive
each shared component wraps.

**[Heroicons](https://heroicons.com).** One icon set, one variant, imported per use so the build
keeps only what a screen draws.

**[vue-i18n](https://vue-i18n.intlify.dev)**, with
[`@intlify/unplugin-vue-i18n`](https://github.com/intlify/bundle-tools) compiling the bundles at
build time. Every string an operator reads comes from a bundle;
[the i18n standard](i18n-standard.md) says how.

## The tooling

| Tool | Does |
| --- | --- |
| `vue-tsc` | type-checks the sources and the templates, as `npm run type-check` |
| ESLint | the Vue and TypeScript rules, as `npm run lint` |
| Prettier | formatting, as `npm run format`; CI checks it |
| Steiger | the Feature-Sliced Design rules, as `npm run lint:arch` |
| `npm-run-all2` | runs the type-check and the build together behind `npm run build` |

[Running locally](running-locally.md) is what to type; CI runs ESLint, Steiger, the format check and
the build on every push to `main` and every pull request targeting it.

## What is not used

**No test framework.** Nothing in the repository runs a test, and
[the general code standard](general-code-standard.md) is what a change is held to instead.

**No component library.** The shared components are written here against reka-ui primitives.

**No HTTP client library.** `AbstractApi` wraps `fetch` directly, because what it adds — the bearer
token, the schema validation, the renewal retry and the error mapping — is this panel's own and not
an interceptor stack.

**No form validation library.** `vee-validate` and `yup` were declared and never imported, and were
removed in #124. A form here is a handful of fields checked in the submit handler, and
[the component code standard](component-code-standard.md) states that shape as the rule.

**No functional helper library, no merge helper, no date library.** `rambda`, `ts-deepmerge` and
`@js-temporal/polyfill` went with them. What the panel does to a collection is a `map` or a
`filter`, a response is read rather than merged into anything, and a date goes through
[`shared/lib/DateUtils`](../src/shared/lib/DateUtils.ts) on the platform `Date`.

**No state persistence, no client-side cache.** A store is filled by a request and emptied by a
`$reset()`; a screen shows what the last response said.

---

← [Design documentation](index.md)
