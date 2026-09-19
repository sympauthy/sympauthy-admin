# SympAuthy Admin

The operator's panel of [SympAuthy](https://github.com/sympauthy/sympauthy), an open-source,
self-hosted OAuth2 and OpenID Connect authorization server. It inspects the accounts, clients,
claims, scopes, audiences, invitations and interactive flow sessions the server owns, and performs
the actions an operator takes on them.

Vue 3 and Vite, built into static assets the authorization server serves itself.

## Using SympAuthy Admin

The panel ships with the server. How to configure and run one is the
[public documentation](https://sympauthy.github.io).

## Working on SympAuthy Admin

**[`docs/`](docs/index.md) is the authority on how this panel is built** — the architecture, the
standards every layer holds to, and the decisions behind them. Read the document governing a change
before the code it governs.

To set the project up and run it, see [Running locally](docs/running-locally.md).

The recommended IDE setup is [VS Code](https://code.visualstudio.com/) with
[Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar), Vetur disabled.
