<script lang="ts" setup>
import type { RouteParamsRawGeneric } from 'vue-router'
import { SaRecordLink } from '@sympauthy/design'
import RouteLink from './RouteLink.vue'

/**
 * The design system's link to another record, plus the two things it cannot know: the router its
 * link goes through, and the scopes the screen it opens is guarded by.
 */
withDefaults(
  defineProps<{
    name: string
    to: { name: string; params?: RouteParamsRawGeneric }
    /** Cut with an ellipsis rather than wrapped, where a line holds one value. */
    truncate?: boolean
    /** For a name read character by character: an identifier, a client's ID. */
    mono?: boolean
  }>(),
  {
    truncate: false,
    mono: false
  }
)
</script>

<template>
  <SaRecordLink
    :name="name"
    :link="{ to, bare: true }"
    :link-as="RouteLink"
    :truncate="truncate"
    :mono="mono"
  />
</template>
