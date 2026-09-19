<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import {
  useInteractiveFlowSessionDetailStore,
  purposeLabel,
  purposeProgressColor,
  purposeProgressLabel
} from '@/entities/session'
import { HelpTooltip, Tag } from '@/shared/ui'

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
    <div class="flex justify-end">
      <HelpTooltip>{{ t('pages.sessionPurposes.help') }}</HelpTooltip>
    </div>

    <div
      v-for="(progress, progressIndex) in store.session.purposes"
      :key="progressIndex"
      class="bg-white rounded-lg border border-gray-200"
    >
      <div
        class="flex items-center justify-between gap-2 border-b border-gray-200 px-4 py-3 sm:px-6"
      >
        <h3 class="text-sm font-semibold text-gray-900">
          {{ purposeLabel(progress.purpose) }}
        </h3>
        <Tag :color="purposeProgressColor(progress.status)">
          {{ purposeProgressLabel(progress.status) }}
        </Tag>
      </div>

      <dl v-if="progress.debug.length > 0" class="divide-y divide-gray-200">
        <div
          v-for="(information, informationIndex) in progress.debug"
          :key="informationIndex"
          class="px-4 py-3 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center"
        >
          <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {{ information.display_name }}
          </dt>
          <!-- An entry is never dropped: a field that holds nothing keeps its label, since a
               field that has gone missing and a field that is empty are different things. -->
          <dd class="mt-1 sm:mt-0 sm:col-span-2 text-sm text-gray-900 font-mono break-words">
            <span v-if="information.value">{{ information.value }}</span>
            <span v-else class="text-gray-300 font-sans">&mdash;</span>
          </dd>
        </div>
      </dl>
      <p v-else class="px-4 py-3 sm:px-6 text-sm text-gray-500">
        {{ t('pages.sessionPurposes.noDebugInformation') }}
      </p>
    </div>
  </div>
</template>
