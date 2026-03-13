<script lang='ts' setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div>
    <p class='text-gray-600'>{{ t('pages.dashboard.welcome') }}</p>
  </div>
</template>
