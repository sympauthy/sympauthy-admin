<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { DocLink, HelpTooltip } from '@/shared/ui'

const { t } = useI18n()
</script>

<template>
  <HelpTooltip>
    <i18n-t keypath="client.type.help" tag="p">
      <template #link>
        <DocLink :href="t('client.type.helpLinkUrl')">
          {{ t('client.type.helpLinkText') }}
        </DocLink>
      </template>
    </i18n-t>
  </HelpTooltip>
</template>
