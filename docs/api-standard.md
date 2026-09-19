---
description: How the panel calls the authorization server — one client per surface, a validated
  resource per response, and what a call resolves to.
paths:
  - "src/shared/api/**"
  - "src/entities/*/api/**"
  - "src/entities/*/model/*Resource.ts"
---

# API standard

Every screen is a call to the server's admin surface. `AbstractApi` holds what every call shares —
the bearer token, the schema validation, the renewal retry and the error mapping — and a client per
surface holds the calls themselves.

## Clients

**A client is named `…Api`, extends `AbstractApi`, and lives in its slice's `api/` segment.** One
client per surface of the server, not one per screen: `UserApi`, `UserMfaApi`,
`InteractiveFlowSessionApi`.

**A method is named after the call it makes** — `listUsers`, `getUser`, `createInvitation`,
`revokeConsent`, `logoutUser` — and returns `Promise<SuccessApiResponse<T> | ErrorApiResponse>`.

**The path is written in full at the call site**, with the identifiers interpolated:

```ts
return this.get<UserClaimListResource>({
  path: `/api/v1/admin/users/${userId}/claims`,
  params: this.toQueryParams(params),
  schema: userClaimListResourceSchema
})
```

**A call expecting a body uses `get`, `post` or `put` and passes its schema.** A call expecting none
uses `postVoid` or `delete`, and resolves to a `SuccessApiResponse<void>`.

**The parameters of a list call are a `List…Params` interface**, every field optional, with a
`[key: string]: string | number | undefined` index signature so a filter named at runtime fits.

**Query parameters go through `toQueryParams`.** It drops what the caller left unset, because an
absent filter and an empty one mean the same thing to every list endpoint.

## Resources

**A response body is a `…Resource` type, and its AJV schema sits in the same file.** They are
exported together and travel together; nothing declares one without the other.

**A field is spelled as the server spells it.** `user_id`, `created_at`, `error_code` — the resource
is the wire format, and the camelCase name is what a helper over it returns.

**The schema's name is the type's, with a lowercase initial and `Schema` appended.**
`UserListResource` is validated by `userListResourceSchema`.

**A schema sets `additionalProperties: true`.** The panel reads the fields it needs, and a server
that publishes one more must not blank a screen.

**`required` lists exactly the fields the type declares non-optional**, and every optional field is
`nullable: true`.

**A body holding a page of records is a `…ListResource` carrying `page`, `size`, `total` and an
array named after what it holds.** The item resource is spread into it — `items: {
...userResourceSchema }` — so one declaration validates both.

**A resource is named for the entity it belongs to, not for the concept it shares with another.**
The claims the server is configured with are `ClaimResource`; the values held for a person are
`UserClaimResource`.

**A rule over a resource is a function in the file declaring it.** `userIdentifierLabel` reads a
user's claims and answers what to display; a component does not spell that rule out again.

## What a call resolves to

**A call resolves, and never throws.** Every failure — the fetch that did not reach the server, the
non-success status, the body that did not match its schema — comes back as an `ErrorApiResponse`.

**A caller narrows with `isSuccess` and reads `content`**, and takes the message for the failure
branch from `getErrorMessage`:

```ts
const response = await api.listUsers(params)
if (isSuccess(response)) {
  users.value = response.content.users
} else {
  error.value = getErrorMessage(response)
}
```

**A per-field failure is read with `getErrorMessageForProperties`,** which maps the server's
property paths to the messages a form shows beside its fields.

**An error code is a message key.** The server's `error_code` names the message, and the two the
panel raises itself are `api.unknown` and `api.unauthorized`;
[the i18n standard](i18n-standard.md) owns the bundle they are read from.

**A body that fails its schema is logged and becomes `api.unknown`.** A contract that drifted is a
server error, and a screen says so rather than rendering an undefined field.

**A caller never renews a token and never retries.** `AbstractApi` answers a 401 with one silent
renew and one retry, and gives up with `api.unauthorized`;
[authentication](authentication.md#staying-signed-in) describes the rest of that flow.

**Nothing outside `shared/api` and a slice's `api/` segment calls `fetch`.**

## What this standard does not cover

**Cancelling a request.** A screen left before its response arrives writes into a store nobody
reads.

**Caching and revalidation.** Every screen fetches what it shows, every time it shows it.

**Retries other than the 401 one.** A network failure is reported, not retried.

**Optimistic updates.** An action refetches what it changed.

**Uploads, downloads and streaming.** The admin surface publishes JSON, and that is all the panel
speaks.

---

← [Design documentation](index.md)
