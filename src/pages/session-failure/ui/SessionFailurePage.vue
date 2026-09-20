<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { CommonAlert, CommonCard, DefinitionList, DefinitionRow, EmptyValue } from '@/shared/ui'
import { useInteractiveFlowSessionDetailStore } from '@/entities/session'

/**
 * Why one session ended where it did: the messages the server failed it with.
 *
 * The session is fetched by the record's shell above this route, which renders nothing until it has
 * arrived — so the store always holds one here. The tab names this view, so nothing here repeats
 * the name as a heading.
 */
const { t } = useI18n()
const store = useInteractiveFlowSessionDetailStore()
</script>

<template>
  <!-- The strip above offers this tab to a failed session only, but the route stays reachable by
       hand — a session that has not failed yet is told so rather than shown a row of empty
       identifiers. -->
  <CommonCard v-if="store.session && store.session.status !== 'failed'">
    <p class="text-sm text-gray-600">{{ t('pages.sessionFailure.notFailed') }}</p>
  </CommonCard>

  <!-- The identifiers below are message keys and stay keys: the API publishes them unrendered so an
       operator can grep the server for one, where a sentence in the wrong locale would tell them
       less. -->
  <div v-else-if="store.session" class="space-y-4">
    <CommonAlert color="danger">
      {{ t('pages.sessionFailure.alert') }}
    </CommonAlert>

    <DefinitionList>
      <DefinitionRow mono :label="t('pages.sessionFailure.errorDetailsId')">
        <span v-if="store.session.error_details_id">{{ store.session.error_details_id }}</span>
        <EmptyValue v-else />
      </DefinitionRow>
      <DefinitionRow mono :label="t('pages.sessionFailure.errorDescriptionId')">
        <span v-if="store.session.error_description_id">
          {{ store.session.error_description_id }}
        </span>
        <EmptyValue v-else />
      </DefinitionRow>
      <DefinitionRow v-for="(value, key) in store.session.error_values ?? {}" :key="key" mono>
        <template #label>
          <span class="font-mono break-all normal-case">{{ key }}</span>
        </template>
        {{ value }}
      </DefinitionRow>
    </DefinitionList>
  </div>
</template>
