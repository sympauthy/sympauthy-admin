<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { SaTag } from '@sympauthy/design'
import { DocHelpTooltip } from '@/shared/ui'

// A screen showing whether a claim is required elsewhere in its row leaves [required] out: an
// account's claims say it beside a value that was not collected, the one place it asks for action.
withDefaults(
  defineProps<{
    required?: boolean
    identifier?: boolean
  }>(),
  { required: false, identifier: false }
)

const { t } = useI18n()
</script>

<template>
  <!-- One line, because the column holding these is shrink-wrapped around them: a row wrapping
       its two tags is taller than every row beside it, and the set is two short words. -->
  <div class="flex gap-1">
    <SaTag v-if="required" color="purple">
      {{ t('pages.claims.required') }}
      <template #help>
        <DocHelpTooltip term="terms.claim.required" />
      </template>
    </SaTag>
    <SaTag v-if="identifier" color="blue">
      {{ t('pages.claims.identifier') }}
      <template #help>
        <DocHelpTooltip term="terms.claim.identifier" />
      </template>
    </SaTag>
  </div>
</template>
