<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import {
  CommonTag,
  DefinitionList,
  DefinitionRow,
  DetailSection,
  DocHelpTooltip
} from '@/shared/ui'
import type { ClientDetailResource } from '@/entities/client'

defineProps<{
  client: ClientDetailResource
}>()

const { t } = useI18n()
</script>

<template>
  <DetailSection :title="t('pages.clientDetail.authorization')">
    <DefinitionList>
      <DefinitionRow>
        <template #label>
          {{ t('pages.clientDetail.grantTypes.label') }}
          <DocHelpTooltip term="pages.clientDetail.grantTypes" />
        </template>
        <div class="flex flex-wrap gap-1">
          <CommonTag v-for="grantType in client.allowed_grant_types" :key="grantType" color="blue">
            {{ grantType }}
          </CommonTag>
        </div>
      </DefinitionRow>
      <DefinitionRow v-if="client.authorization_flow_id" mono>
        <template #label>
          {{ t('pages.clientDetail.authorizationFlow') }}
          <DocHelpTooltip term="terms.flow.id" />
        </template>
        {{ client.authorization_flow_id }}
      </DefinitionRow>
      <template v-if="client.authorization_webhook">
        <DefinitionRow mono>
          <template #label>
            {{ t('pages.clientDetail.webhookUrl.label') }}
            <DocHelpTooltip term="pages.clientDetail.webhookUrl" />
          </template>
          {{ client.authorization_webhook.url }}
        </DefinitionRow>
        <DefinitionRow>
          <template #label>
            {{ t('pages.clientDetail.webhookOnFailure.label') }}
            <DocHelpTooltip term="pages.clientDetail.webhookOnFailure" />
          </template>
          <CommonTag
            :color="client.authorization_webhook.on_failure === 'deny_all' ? 'red' : 'yellow'"
          >
            {{ client.authorization_webhook.on_failure }}
          </CommonTag>
        </DefinitionRow>
      </template>
    </DefinitionList>
  </DetailSection>
</template>
