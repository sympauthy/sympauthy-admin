<script lang="ts" setup>
import { computed } from 'vue'
import type { RouteParamsRawGeneric } from 'vue-router'
import { SaTooltip } from '@sympauthy/design'
import { missingScopesHint, useRouteAccess } from '@/shared/auth'

/**
 * A link to another screen of the panel, drawn disabled where the token cannot open it — saying
 * which scopes it lacks — rather than leading to the guard, which would send the operator back to
 * where they stood and look like a click that did nothing.
 *
 * The classes a caller passes reach the link and its disabled stand-in alike.
 */
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    to: { name: string; params?: RouteParamsRawGeneric }
    /**
     * For a link under a parent cutting its value with an ellipsis, which would clip the target
     * around an inline link. It takes the height itself instead, and the ellipsis with it.
     */
    block?: boolean
  }>(),
  {
    block: false
  }
)

const { missingScopes } = useRouteAccess()

const hint = computed(() => missingScopesHint(missingScopes(props.to.name, props.to.params) ?? []))

// Padding on an inline box is a target that opens up no line, so a link keeps to the value around it.
// A block one lines up with its neighbours: a cell centres them, and a field starts them at the top.
const targetClasses = computed(() =>
  props.block
    ? 'block min-h-control w-fit max-w-full overflow-hidden text-ellipsis in-[td]:content-center'
    : 'py-3.5'
)
</script>

<template>
  <SaTooltip v-if="hint" :text="hint">
    <span
      v-bind="$attrs"
      role="link"
      aria-disabled="true"
      tabindex="0"
      :class="targetClasses"
      class="cursor-not-allowed"
    >
      <slot />
    </span>
  </SaTooltip>
  <RouterLink v-else v-bind="$attrs" :to="to" :class="targetClasses" class="hover:underline">
    <slot />
  </RouterLink>
</template>
