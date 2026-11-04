<script lang="ts" setup>
import { computed, type FunctionalComponent } from 'vue'
import { SaButton, SaTooltip, type SaButtonProps } from '@sympauthy/design'
import { useAuthStore, missingScopesHint } from '@/shared/auth'

/**
 * The design system's button, plus the one thing it cannot know: the scopes behind it. Everything
 * else is handed down as it arrived.
 */
interface Props extends SaButtonProps {
  /**
   * The admin scopes the call behind the button is made under. A button the token is not granted
   * all of is drawn refused, naming them in a `SaTooltip`, rather than offered to fail at the
   * server.
   */
  requiredScopes?: string[]
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<Props>(), {
  requiredScopes: () => []
})

const authStore = useAuthStore()

const hint = computed(() => missingScopesHint(authStore.missingScopes(props.requiredScopes)))

const buttonProps = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { requiredScopes, ...rest } = props
  return { ...rest, refused: rest.refused || hint.value !== undefined }
})

// Renders its content as it is, standing in for `SaTooltip` around a button the token covers, so
// that one's element is the <button> itself: an `as-child` trigger positions against it.
const Bare: FunctionalComponent = (_, { slots }) => slots.default?.()[0]
</script>

<template>
  <component :is="hint ? SaTooltip : Bare" v-bind="hint ? { text: hint } : {}">
    <SaButton v-bind="{ ...$attrs, ...buttonProps }">
      <template v-for="(_, name) in $slots" #[name]>
        <slot :name="name" />
      </template>
    </SaButton>
  </component>
</template>
