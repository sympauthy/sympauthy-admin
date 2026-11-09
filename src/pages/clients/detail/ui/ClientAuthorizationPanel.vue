<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { SaDefinitionList, SaDefinitionRow, SaDetailSection, SaTag } from '@sympauthy/design'
import { DocHelpTooltip } from '@/shared/ui'
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
          <span class="block text-sm font-normal tracking-normal text-gray-600 normal-case">
            {{ t('pages.clientDetail.grantTypes.detail') }}
          </span>
        </template>
        <!-- The protocol's own names, which the help explains one by one, rather than a
             classification a colour would stand for. -->
        <div class="flex flex-wrap gap-1">
          <SaTag
            v-for="grantType in client.allowed_grant_types"
            :key="grantType"
            color="gray"
            class="font-mono"
          >
            {{ grantType }}
          </SaTag>
        </div>
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
