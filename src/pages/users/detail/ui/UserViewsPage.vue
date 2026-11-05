<script lang="ts" setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { SaRecordViews } from '@sympauthy/design'
import { useUserViews } from '../model/useUserViews'

/**
 * What a phone opens an account on, under its summary: there is no room for tabs and the view under
 * them, so each view is a screen of its own, reached from here.
 */
const { t } = useI18n()
const userViews = useUserViews()

const views = computed(() =>
  userViews.value.map(({ name, label, description, to }) => ({
    key: name,
    label,
    description,
    link: { to }
  }))
)
</script>

<template>
  <SaRecordViews :views="views" :label="t('pages.userDetail.views')" :link-as="RouterLink" />
</template>
