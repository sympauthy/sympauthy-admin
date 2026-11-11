<script lang="ts" setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { SaRecordViews } from '@sympauthy/design'
import { useInteractiveFlowSessionViews } from '../model/useInteractiveFlowSessionViews'

/**
 * What a phone opens a session on, under its summary: there is no room for tabs and the view under
 * them, so each view is a screen of its own, reached from here.
 */
const { t } = useI18n()
const sessionViews = useInteractiveFlowSessionViews()

const views = computed(() =>
  sessionViews.value.map(({ name, label, description, to }) => ({
    key: name,
    label,
    description,
    link: { to }
  }))
)
</script>

<template>
  <SaRecordViews :views="views" :label="t('pages.sessionDetail.views')" :link-as="RouterLink" />
</template>
