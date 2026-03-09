<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import HelpTooltip from '@/components/HelpTooltip.vue'

const { t } = useI18n()
</script>

<template>
  <HelpTooltip>
    <i18n-t keypath="client.type.help" tag="p">
      <template #link>
        <a
          :href="t('client.type.helpLinkUrl')"
          target="_blank"
          rel="noopener noreferrer"
          class="text-blue-600 hover:underline"
        >
          {{ t('client.type.helpLinkText') }}
        </a>
      </template>
    </i18n-t>
  </HelpTooltip>
</template>