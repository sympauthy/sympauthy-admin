<script lang="ts" setup>
import type { RouteParamsRawGeneric } from 'vue-router'
import { SaTableRecord } from '@sympauthy/design'
import RouteLink from './RouteLink.vue'

/**
 * The design system's record, plus the two things it cannot know: the router its link goes through,
 * and the scopes the screen it opens is guarded by.
 *
 * A name wraps whatever the cell around it says: a truncated cell holds its text to one line, which
 * would run the name under its own chevron rather than cut it.
 */
defineProps<{
  name: string
  to: { name: string; params?: RouteParamsRawGeneric }
  /** A value read character by character, under the name from `sm:`. */
  detail?: string
  /**
   * Words under the name from `sm:`, in place of a detail: what the record holds, rather than an
   * identifier. The package sets its detail in monospace, so this one is drawn beside it, in the
   * detail's size and ink.
   */
  caption?: string
}>()
</script>

<template>
  <div class="flex min-w-0 flex-col items-start">
    <SaTableRecord
      class="whitespace-normal"
      :name="name"
      :detail="detail"
      :link="{ to, bare: true }"
      :link-as="RouteLink"
    />
    <span v-if="caption" class="hidden max-w-full truncate text-xs text-gray-500 sm:block">
      {{ caption }}
    </span>
  </div>
</template>
