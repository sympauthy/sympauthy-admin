<script lang="ts" setup>
import type { RouteParamsRawGeneric } from 'vue-router'
import { SaTableRecord } from '@sympauthy/design'
import RouteLink from './RouteLink.vue'

/**
 * The design system's record, plus the two things it cannot know: the router its link goes through,
 * and the scopes the screen it opens is guarded by.
 *
 * A name wraps whatever the cell around it says, unless it is handed `truncate`: a truncated cell
 * holds its text to one line, which would run the name under its own chevron rather than cut it.
 */
defineProps<{
  name: string
  to: { name: string; params?: RouteParamsRawGeneric }
  /** A value read character by character, under the name from `sm:`. */
  detail?: string
  /** Cut with an ellipsis rather than wrapped, under a `truncate` cell. */
  truncate?: boolean
}>()
</script>

<template>
  <SaTableRecord
    class="whitespace-normal"
    :name="name"
    :detail="detail"
    :truncate="truncate"
    :link="{ to, bare: true }"
    :link-as="RouteLink"
  />
</template>
