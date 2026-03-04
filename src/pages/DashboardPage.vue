<script lang='ts' setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div>
    <h1 class='text-2xl font-bold mb-4'>{{ t('pages.dashboard.title') }}</h1>
    <p class='text-gray-600'>{{ t('pages.dashboard.welcome') }}</p>
  </div>
</template>
