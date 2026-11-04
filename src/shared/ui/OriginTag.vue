<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { SaTag } from '@sympauthy/design'

const props = defineProps<{
  origin: string
}>()

const { t } = useI18n()

const color = computed<'blue' | 'gray' | 'yellow'>(() => {
  switch (props.origin) {
    case 'openid':
    case 'oauth2':
      return 'blue'
    case 'custom':
      return 'yellow'
    default:
      return 'gray'
  }
})
</script>

<template>
  <SaTag :color="color">
    {{ t(`terms.origin.values.${origin}`) }}
  </SaTag>
</template>
