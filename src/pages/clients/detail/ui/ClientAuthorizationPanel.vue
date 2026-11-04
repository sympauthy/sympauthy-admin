<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import {
  DocHelpTooltip,
  SaDefinitionList,
  SaDefinitionRow,
  SaDetailSection,
  SaTag
} from '@/shared/ui'
import type { ClientDetailResource } from '@/entities/client'

defineProps<{
  client: ClientDetailResource
}>()

const { t } = useI18n()
</script>

<template>
  <SaDetailSection :title="t('pages.clientDetail.authorization')">
    <SaDefinitionList>
      <SaDefinitionRow>
        <template #label>
          {{ t('pages.clientDetail.grantTypes.label') }}
          <DocHelpTooltip term="pages.clientDetail.grantTypes" />
        </template>
        <div class="flex flex-wrap gap-1">
          <SaTag v-for="grantType in client.allowed_grant_types" :key="grantType" color="blue">
            {{ grantType }}
          </SaTag>
        </div>
      </SaDefinitionRow>
      <SaDefinitionRow v-if="client.authorization_flow_id" mono>
        <template #label>
          {{ t('pages.clientDetail.authorizationFlow') }}
          <DocHelpTooltip term="terms.flow.id" />
        </template>
        {{ client.authorization_flow_id }}
      </SaDefinitionRow>
      <template v-if="client.authorization_webhook">
        <SaDefinitionRow mono>
          <template #label>
            {{ t('pages.clientDetail.webhookUrl.label') }}
            <DocHelpTooltip term="pages.clientDetail.webhookUrl" />
          </template>
          {{ client.authorization_webhook.url }}
        </SaDefinitionRow>
        <SaDefinitionRow>
          <template #label>
            {{ t('pages.clientDetail.webhookOnFailure.label') }}
            <DocHelpTooltip term="pages.clientDetail.webhookOnFailure" />
          </template>
          <SaTag :color="client.authorization_webhook.on_failure === 'deny_all' ? 'red' : 'yellow'">
            {{ client.authorization_webhook.on_failure }}
          </SaTag>
        </SaDefinitionRow>
      </template>
    </SaDefinitionList>
  </SaDetailSection>
</template>
