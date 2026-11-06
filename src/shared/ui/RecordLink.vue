<script lang="ts" setup>
import { computed } from 'vue'
import type { RouteParamsRawGeneric } from 'vue-router'
import { SaRecordLink, SaTooltip } from '@sympauthy/design'
import { missingScopesHint, useRouteAccess } from '@/shared/auth'
import RouteLink from './RouteLink.vue'

/**
 * The design system's link to another record, plus the two things it cannot know: the router its
 * link goes through, and the scopes the screen it opens is guarded by.
 *
 * A record the token cannot open is named in plain text, saying which scopes it lacks: drawn as the
 * package's link, it would read as one that works. A name cut short carries itself whole in its
 * title.
 */
const props = withDefaults(
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

const { missingScopes } = useRouteAccess()

const hint = computed(() => missingScopesHint(missingScopes(props.to.name, props.to.params) ?? []))
const title = computed(() => (props.truncate ? props.name : undefined))
</script>

<template>
  <SaTooltip v-if="hint" :text="hint">
    <span
      role="link"
      aria-disabled="true"
      tabindex="0"
      class="inline-block max-w-full cursor-not-allowed align-bottom"
      :class="{ truncate, 'font-mono': mono, 'wrap-anywhere': !truncate }"
      :title="title"
    >
      {{ name }}
    </span>
  </SaTooltip>
  <SaRecordLink
    v-else
    :name="name"
    :link="{ to, bare: true }"
    :link-as="RouteLink"
    :truncate="truncate"
    :mono="mono"
    :title="title"
  />
</template>
