<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { DefinitionList, DefinitionRow, DetailSection, CommonTag } from '@/shared/ui'
import type { ClientDetailResource } from '@/entities/client'

defineProps<{
  client: ClientDetailResource
}>()

const { t } = useI18n()
</script>

<template>
  <DetailSection :title="t('pages.clientDetail.authorization')">
    <DefinitionList>
      <DefinitionRow :label="t('pages.clientDetail.grantTypes')">
        <div class="flex flex-wrap gap-1">
          <CommonTag v-for="grantType in client.allowed_grant_types" :key="grantType" color="blue">
            {{ grantType }}
          </CommonTag>
        </div>
      </DefinitionRow>
      <DefinitionRow
        v-if="client.authorization_flow_id"
        mono
        :label="t('pages.clientDetail.authorizationFlow')"
      >
        {{ client.authorization_flow_id }}
      </DefinitionRow>
      <template v-if="client.authorization_webhook">
        <DefinitionRow mono :label="t('pages.clientDetail.webhookUrl')">
          {{ client.authorization_webhook.url }}
        </DefinitionRow>
        <DefinitionRow :label="t('pages.clientDetail.webhookOnFailure')">
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
