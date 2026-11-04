<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { SaAlert, SaCopyButton } from '@sympauthy/design'

/**
 * A value the server answered once and will not answer again — an invitation's token, a link
 * enrolling a second factor. It is shown with the warning that says so, and with the one control
 * that gets it out of the panel, because closing the dialog is what loses it.
 */
defineProps<{
  value: string
}>()

const { t } = useI18n()
</script>

<template>
  <div>
    <SaAlert color="warning" class="mb-4">
      <slot name="warning" />
    </SaAlert>

    <div class="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 p-3">
      <code class="flex-1 text-sm break-all">{{ value }}</code>
      <SaCopyButton
        :value="value"
        :label="t('common.copy')"
        :copied-label="t('common.copied')"
        :failed-label="t('common.copyFailed')"
      />
    </div>
  </div>
</template>
