<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { SCOPE_TYPES, scopeTypeLabel } from '../model/ScopeResource'

/**
 * What the look of a scope's tag says, for a section listing scopes by name alone: a name does not
 * tell a consentable scope from a grantable one, and the tag is the only thing that does. It names
 * every type, whichever the section draws, so the key reads the same on every record.
 */
const { t } = useI18n()

// A swatch of each tag `scopeTypeTag` draws: its fill, or its ring on surface.
const swatchClasses: Record<(typeof SCOPE_TYPES)[number], string> = {
  consentable: 'bg-tag-blue-fill',
  grantable: 'bg-white inset-ring inset-ring-tag-purple-line',
  client: 'bg-gray-700'
}
</script>

<template>
  <ul
    :aria-label="t('terms.scope.type.legend')"
    class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500"
  >
    <li v-for="type in SCOPE_TYPES" :key="type" class="inline-flex items-center gap-1.5">
      <span aria-hidden="true" class="size-2.5 rounded-sm" :class="swatchClasses[type]" />
      {{ scopeTypeLabel(type) }}
    </li>
  </ul>
</template>
