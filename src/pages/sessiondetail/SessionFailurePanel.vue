<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import DetailSection from '@/components/DetailSection.vue'
import HelpTooltip from '@/components/HelpTooltip.vue'
import CommonAlert from '@/components/CommonAlert.vue'
import type { InteractiveFlowSessionDetailResource } from '@/client/model/InteractiveFlowSessionDetailResource'

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

      <dl class="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
        <div class="px-4 py-3 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center">
          <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {{ t('pages.sessionDetail.errorDetailsId') }}
          </dt>
          <dd class="mt-1 sm:mt-0 sm:col-span-2 text-sm text-gray-900 font-mono break-all">
            <span v-if="session.error_details_id">{{ session.error_details_id }}</span>
            <span v-else class="text-gray-300 font-sans">&mdash;</span>
          </dd>
        </div>
        <div class="px-4 py-3 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center">
          <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {{ t('pages.sessionDetail.errorDescriptionId') }}
          </dt>
          <dd class="mt-1 sm:mt-0 sm:col-span-2 text-sm text-gray-900 font-mono break-all">
            <span v-if="session.error_description_id">{{ session.error_description_id }}</span>
            <span v-else class="text-gray-300 font-sans">&mdash;</span>
          </dd>
        </div>
        <div
          v-for="(value, key) in session.error_values ?? {}"
          :key="key"
          class="px-4 py-3 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center"
        >
          <dt class="text-xs font-medium text-gray-500 font-mono break-all">{{ key }}</dt>
          <dd class="mt-1 sm:mt-0 sm:col-span-2 text-sm text-gray-900 font-mono break-all">
            {{ value }}
          </dd>
        </div>
      </dl>
    </div>
  </DetailSection>
</template>
