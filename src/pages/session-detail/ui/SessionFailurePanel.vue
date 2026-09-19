<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import {
  CommonAlert,
  DefinitionList,
  DefinitionRow,
  DetailSection,
  EmptyValue,
  HelpTooltip
} from '@/shared/ui'
import type { InteractiveFlowSessionDetailResource } from '@/entities/session'

defineProps<{
  session: InteractiveFlowSessionDetailResource
}>()

const { t } = useI18n()
</script>

<template>
  <!-- The identifiers below are message keys and stay keys: the API publishes them unrendered so an
       operator can grep the server for one, where a sentence in the wrong locale would tell them
       less. -->
  <DetailSection :title="t('pages.sessionDetail.failure')">
    <template #help>
      <HelpTooltip>{{ t('pages.sessionDetail.failureHelp') }}</HelpTooltip>
    </template>

    <div class="space-y-4">
      <CommonAlert color="danger">
        {{ t('pages.sessionDetail.failureAlert') }}
      </CommonAlert>

      <DefinitionList>
        <DefinitionRow mono :label="t('pages.sessionDetail.errorDetailsId')">
          <span v-if="session.error_details_id">{{ session.error_details_id }}</span>
          <EmptyValue v-else />
        </DefinitionRow>
        <DefinitionRow mono :label="t('pages.sessionDetail.errorDescriptionId')">
          <span v-if="session.error_description_id">{{ session.error_description_id }}</span>
          <EmptyValue v-else />
        </DefinitionRow>
        <DefinitionRow v-for="(value, key) in session.error_values ?? {}" :key="key" mono>
          <template #label>
            <span class="font-mono break-all normal-case">{{ key }}</span>
          </template>
          {{ value }}
        </DefinitionRow>
      </DefinitionList>
    </div>
  </DetailSection>
</template>
