<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import {
  useInteractiveFlowSessionDetailStore,
  purposeLabel,
  purposeProgressColor,
  purposeProgressLabel
} from '@/entities/session'
import { CommonCard, DefinitionRow, EmptyValue, CommonTag } from '@/shared/ui'

/**
 * The purposes one session carries, and how far each of them got.
 *
 * The session is fetched by the record's shell above this route, which renders nothing until it has
 * arrived — so the store always holds one here. The tab names this view, so nothing here repeats
 * the name as a heading.
 */
const { t } = useI18n()
const store = useInteractiveFlowSessionDetailStore()
</script>

<template>
  <!-- Every purpose is rendered expanded, pending ones included: an empty field on a purpose that
       has not run yet is itself the answer to how far the session got. The labels are written by
       the handler that owns each purpose, are rendered as they arrive and are never translated. -->
  <div v-if="store.session" class="space-y-4">
    <CommonCard
      v-for="(progress, progressIndex) in store.session.purposes"
      :key="progressIndex"
      :padded="false"
    >
      <div
        class="flex items-center justify-between gap-2 border-b border-gray-200 px-4 py-3 sm:px-6"
      >
        <h3 class="text-sm font-semibold text-gray-900">
          {{ purposeLabel(progress.purpose) }}
        </h3>
        <CommonTag :color="purposeProgressColor(progress.status)">
          {{ purposeProgressLabel(progress.status) }}
        </CommonTag>
      </div>

      <dl v-if="progress.debug.length > 0" class="divide-y divide-gray-200">
        <!-- An entry is never dropped: a field that holds nothing keeps its label, since a field
             that has gone missing and a field that is empty are different things. -->
        <DefinitionRow
          v-for="(information, informationIndex) in progress.debug"
          :key="informationIndex"
          mono
          :label="information.display_name"
        >
          <span v-if="information.value">{{ information.value }}</span>
          <EmptyValue v-else />
        </DefinitionRow>
      </dl>
      <p v-else class="px-4 py-3 text-sm text-gray-500 sm:px-6">
        {{ t('pages.sessionPurposes.noDebugInformation') }}
      </p>
    </CommonCard>
  </div>
</template>
