<script lang="ts" setup>
import { computed } from 'vue'
import type { RouteParamsRawGeneric } from 'vue-router'
import { missingScopesHint, useRouteAccess } from '@/shared/auth'
import HintTooltip from './HintTooltip.vue'

/**
 * A link to another screen of the panel, drawn disabled where the token cannot open it — saying
 * which scopes it lacks — rather than leading to the guard, which would send the operator back to
 * where they stood and look like a click that did nothing.
 *
 * The classes a caller passes reach the link and its disabled stand-in alike.
 */
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  to: { name: string; params?: RouteParamsRawGeneric }
}>()

const { missingScopes } = useRouteAccess()

const hint = computed(() => missingScopesHint(missingScopes(props.to.name, props.to.params) ?? []))
</script>

<template>
  <HintTooltip v-if="hint" :text="hint">
    <span v-bind="$attrs" role="link" aria-disabled="true" tabindex="0" class="cursor-not-allowed">
      <slot />
    </span>
  </HintTooltip>
  <RouterLink v-else v-bind="$attrs" :to="to" class="hover:underline">
    <slot />
  </RouterLink>
</template>
