<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { DocHelpTooltip, SaCopyableValue, SaSummaryCard, SaSummaryField } from '@/shared/ui'
import type { ClientDetailResource } from '@/entities/client'

defineProps<{
  client: ClientDetailResource
}>()

const { t } = useI18n()
</script>

<template>
  <SaSummaryCard>
    <SaSummaryField mono :label="t('pages.clientDetail.clientId')">
      <SaCopyableValue
        :value="client.client_id"
        :label="t('pages.clientDetail.copyClientId')"
        :copied-label="t('common.copied')"
        :failed-label="t('common.copyFailed')"
      />
    </SaSummaryField>
    <SaSummaryField :label="t('pages.clientDetail.type')">
      <template #help>
        <DocHelpTooltip term="terms.client.type" />
      </template>
      {{ client.type }}
    </SaSummaryField>
    <SaSummaryField :label="t('pages.clientDetail.audience')">
      <template #help>
        <DocHelpTooltip term="terms.audience.id" />
      </template>
      {{ client.audience_id }}
    </SaSummaryField>
  </SaSummaryCard>
</template>
