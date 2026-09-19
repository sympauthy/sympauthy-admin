<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import CommonSpinner from './CommonSpinner.vue'

/**
 * What a screen shows while it waits for the record or the page it was asked for. Every screen says
 * it the same way, so a slow fetch does not look like a different kind of wait on each of them.
 */
withDefaults(
  defineProps<{
    /** Centred in the height it is given, for a wait that fills a page rather than heading one. */
    centered?: boolean
  }>(),
  {
    centered: false
  }
)

const { t } = useI18n()
</script>

<template>
  <div class="flex items-center gap-2" :class="centered ? 'h-full justify-center' : ''">
    <CommonSpinner size="md" />
    <span class="text-sm text-gray-600">{{ t('common.loading') }}</span>
  </div>
</template>
