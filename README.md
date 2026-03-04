# sympauthy-admin

Admin UI for the open-source authorization server [SympAuthy](https://github.com/sympauthy/sympauthy).

This project is built with Vue 3 + Vite and is served directly by the SympAuthy backend.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Project Setup

```sh
nvm use
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

The dev server proxies `/api` requests to `http://localhost:8080` (the SympAuthy backend).

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Format with [Prettier](https://prettier.io/)

```sh
npm run format
```
