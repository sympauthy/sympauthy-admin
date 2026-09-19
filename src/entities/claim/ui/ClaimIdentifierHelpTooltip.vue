<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { DocLink, HelpTooltip } from '@/shared/ui'

const { t } = useI18n()
</script>

<template>
  <HelpTooltip>
    <i18n-t keypath="claim.identifier.help" tag="p">
      <template #link>
        <DocLink :href="t('claim.identifier.helpLinkUrl')">
          {{ t('claim.identifier.helpLinkText') }}
        </DocLink>
      </template>
    </i18n-t>
  </HelpTooltip>
</template>
