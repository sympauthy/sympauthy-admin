<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { CommonTag, DocHelpTooltip } from '@/shared/ui'

defineProps<{
  required: boolean
  identifier: boolean
}>()

const { t } = useI18n()
</script>

<template>
  <!-- One line, because the column holding these is shrink-wrapped around them: a row wrapping
       its two tags is taller than every row beside it, and the set is two short words. -->
  <div class="flex gap-1">
    <CommonTag v-if="required" color="purple">
      {{ t('pages.claims.required') }}
      <template #help>
        <DocHelpTooltip term="terms.claim.required" />
      </template>
    </CommonTag>
    <CommonTag v-if="identifier" color="yellow">
      {{ t('pages.claims.identifier') }}
      <template #help>
        <DocHelpTooltip term="terms.claim.identifier" />
      </template>
    </CommonTag>
  </div>
</template>
