# SympAuthy Admin — design

SympAuthy Admin is the operator's panel of a [SympAuthy](https://github.com/sympauthy/sympauthy)
authorization server. It lists and inspects what the server owns — the accounts, the clients, the
claims, the scopes, the audiences, the invitations and the interactive flow sessions — and performs
the few actions an operator takes on them: forcing a logout, revoking a consent, enrolling a second
factor, issuing an invitation.

It is a Vue 3 single page application, built by Vite and served by the authorization server itself.
It stores nothing: every screen is a call to the server's `/api/v1/admin` surface, authenticated
with a token the panel obtains as an ordinary public OIDC client of the server it administers.
[Technology](technology.md) says why each framework was picked.

These documents are the authority on how the panel is built. They are read before the code they
govern, and a new decision is written here before or alongside the change that implements it. What
they are *not* is a user manual: what the screens mean and how to configure the server behind them
is the [public documentation](https://sympauthy.github.io).

## Contents

### How the system works

- **[Architecture](architecture.md)** — the Feature-Sliced layers, what a slice publishes and what
  may import it, where a new file goes, and the project layout on disk.
- **[Technology](technology.md)** — the frameworks the panel is built on, and why each was picked.
- **[Authentication](authentication.md)** — how an operator signs in, how the token reaches a
  request, and what happens when it expires.
- **[Running locally](running-locally.md)** — setting the project up, running it against a server,
  and the checks a change passes.

### How the code is written

The rules a change is held to. Each is named `<subject>-standard.md`, holds one subject, and reaches
an agent when a file it governs is read.

- **[General code standard](general-code-standard.md)** — what a slice is made of, what may import
  what, and the naming, typing and comment rules that hold everywhere.
- **[Component code standard](component-code-standard.md)** — the shape of a `.vue` file, its props,
  emits and slots, where its state lives, and how a form is handled.
- **[Design system standard](design-system-standard.md)** — the shared kit, the scale its sizes and
  spaces come from, the reka-ui primitives the interactive components wrap, and the colours, icons
  and text styles they are built from.
- **[Page layout standard](page-layout-standard.md)** — what a route, a collection page and a record
  are made of, how a table's columns are sized, and how each adapts to width.
- **[API standard](api-standard.md)** — one client per surface, a validated resource per response,
  and what a call resolves to.
- **[Collection standard](collection-standard.md)** — the document a paged collection publishes
  about itself, the criteria built against it, and the page it is drawn as.
- **[Store standard](store-standard.md)** — what a Pinia store holds, how it fetches and reports
  failure, and the contract a collection store and a detail store each answer.
- **[Internationalization standard](i18n-standard.md)** — the bundle, how a key is named, and how it
  reaches the screen.
- **[Documentation standard](docs-standard.md)** — how a standard here is written, and what it
  states in place of the code that happens to follow it.

## Goals

- **Read the server, never reimplement it.** A rule about what a claim, a scope or a session means
  belongs to the authorization server; the panel shows what the API answered and names it the way
  the API does.
- **One screen per resource, one shape per screen.** A collection and a record are assembled from
  the same components everywhere, so a new resource is a slice and a route rather than a new design.
- **Read what the server accepts, do not encode it.** A collection publishes the fields it filters,
  orders and searches on, and the panel draws its filter bar from that answer — so a deployment's
  own claims, clients and audiences are filterable without a release.
- **Fit the viewport.** A list fills the height it is given and never scrolls the page, on a phone
  as on a desktop.
- **Say what went wrong.** Every call resolves — a failed fetch, a rejected status and a body that
  did not match its schema all end up as a message on the screen that asked for it.
- **Keep the structure checked, not agreed.** Steiger, ESLint, Prettier and the type-checker run in
  CI, so the layering in these documents is enforced rather than remembered.
