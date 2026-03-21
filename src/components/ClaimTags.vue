<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import Tag from '@/components/Tag.vue'
import IdentifierHelpTooltip from '@/components/IdentifierHelpTooltip.vue'

defineProps<{
  required: boolean
  identifier: boolean
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-wrap gap-1">
    <Tag v-if="required" color="purple">
      {{ t('pages.claims.required') }}
    </Tag>
    <Tag v-if="identifier" color="yellow">
      {{ t('pages.claims.identifier') }}
      <template #help>
        <IdentifierHelpTooltip />
      </template>
    </Tag>
  </div>
</template>
