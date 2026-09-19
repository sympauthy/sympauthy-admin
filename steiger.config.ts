import { defineConfig } from 'steiger'
import fsd from '@feature-sliced/steiger-plugin'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // An entity slice owns an API client, its AJV schemas and a Pinia store.
    // Folding one into the single page that happens to read it today would put
    // HTTP and model code inside a route folder — the exact tangle this
    // structure exists to prevent. The rule is a good signal for features and
    // pages, so it stays on everywhere else.
    files: ['./src/entities/**'],
    rules: {
      'fsd/insignificant-slice': 'off',
    },
  },
])
