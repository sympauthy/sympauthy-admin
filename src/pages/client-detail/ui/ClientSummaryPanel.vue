<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { CopyableValue, DocHelpTooltip, SummaryCard, SummaryField } from '@/shared/ui'
import type { ClientDetailResource } from '@/entities/client'

defineProps<{
  client: ClientDetailResource
}>()

const { t } = useI18n()
</script>

<template>
  <SummaryCard>
    <SummaryField mono :label="t('pages.clientDetail.clientId')">
      <CopyableValue :value="client.client_id" :title="t('pages.clientDetail.copyClientId')" />
    </SummaryField>
    <SummaryField :label="t('pages.clientDetail.type')">
      <template #help>
        <DocHelpTooltip term="terms.client.type" />
      </template>
      {{ client.type }}
    </SummaryField>
    <SummaryField :label="t('pages.clientDetail.audience')">
      <template #help>
        <DocHelpTooltip term="terms.audience.id" />
      </template>
      {{ client.audience_id }}
    </SummaryField>
  </SummaryCard>
</template>
