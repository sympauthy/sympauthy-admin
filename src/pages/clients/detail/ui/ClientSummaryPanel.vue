<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { SaCopyableValue, SaEmptyValue, SaSummaryCard, SaSummaryField } from '@sympauthy/design'
import { DocHelpTooltip } from '@/shared/ui'
import { clientTypeLabel, type ClientDetailResource } from '@/entities/client'
import { translateMessageOr } from '@/shared/i18n'

const props = defineProps<{
  client: ClientDetailResource
}>()

const { t } = useI18n()

// What the type means for how the client proves itself, under its name. A type this panel holds no
// sentence for is named alone.
const typeCaption = computed(() =>
  translateMessageOr(`pages.clientDetail.typeCaption.${props.client.type}`, '')
)
</script>

<template>
  <!-- What the client is and how it signs a person in: its identifier, its type, the audience it
       belongs to and the flow it sends a person through, which the canvas lifts out of the
       authorization section beside the three. -->
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
      {{ clientTypeLabel(client.type) }}
      <span v-if="typeCaption" class="block text-xs text-gray-500">{{ typeCaption }}</span>
    </SaSummaryField>
    <!-- An audience has no screen, so it stays plain text, cut by the field itself. -->
    <SaSummaryField mono :label="t('pages.clientDetail.audience')">
      <template #help>
        <DocHelpTooltip term="terms.audience.id" />
      </template>
      <span :title="client.audience_id">{{ client.audience_id }}</span>
    </SaSummaryField>
    <SaSummaryField mono :label="t('pages.clientDetail.authorizationFlow')">
      <template #help>
        <DocHelpTooltip term="terms.flow.id" />
      </template>
      <span v-if="client.authorization_flow_id" :title="client.authorization_flow_id">
        {{ client.authorization_flow_id }}
      </span>
      <SaEmptyValue v-else />
    </SaSummaryField>
  </SaSummaryCard>
</template>
