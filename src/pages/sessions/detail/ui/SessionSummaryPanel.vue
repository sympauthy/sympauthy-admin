<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  SaCopyableValue,
  SaEmptyValue,
  SaSummaryCard,
  SaSummaryField,
  SaTag
} from '@sympauthy/design'
import { DocHelpTooltip, RecordLink } from '@/shared/ui'
import {
  interactiveFlowSessionStatusColor,
  interactiveFlowSessionStatusLabel,
  type InteractiveFlowSessionDetailResource
} from '@/entities/session'
import { userIdentifierLabel } from '@/entities/user'
import { formatDate, formatDateTime, formatTime, isoDateTime } from '@/shared/lib'

const props = defineProps<{
  session: InteractiveFlowSessionDetailResource
}>()

const { t } = useI18n()

const lifetime = computed(() => {
  const { session_date: start, expiration_date: end } = props.session
  const day = formatDate(start)
  return day === formatDate(end)
    ? { start: formatTime(start), end: formatTime(end), day }
    : { start: formatDateTime(start), end: formatDateTime(end), day: undefined }
})
</script>

<template>
  <SaSummaryCard>
    <SaSummaryField mono :label="t('pages.sessionDetail.sessionId')">
      <SaCopyableValue
        :value="session.id"
        :label="t('pages.sessionDetail.copySessionId')"
        :copied-label="t('common.copied')"
        :failed-label="t('common.copyFailed')"
      />
    </SaSummaryField>
    <SaSummaryField :label="t('pages.sessionDetail.status')">
      <template #help>
        <DocHelpTooltip term="terms.interactiveFlowSession.status" />
      </template>
      <SaTag :color="interactiveFlowSessionStatusColor(session.status)">
        {{ interactiveFlowSessionStatusLabel(session.status) }}
      </SaTag>
    </SaSummaryField>
    <SaSummaryField mono :label="t('pages.sessionDetail.flow')">
      <template #help>
        <DocHelpTooltip term="terms.flow.id" />
      </template>
      <span v-if="session.flow_id">{{ session.flow_id }}</span>
      <SaEmptyValue v-else />
    </SaSummaryField>
    <SaSummaryField :label="t('pages.sessionDetail.user')">
      <template #help>
        <DocHelpTooltip term="terms.interactiveFlowSession.user" />
      </template>
      <RecordLink
        v-if="session.user"
        truncate
        :name="userIdentifierLabel(session.user)"
        :to="{ name: 'userDetail', params: { userId: session.user.user_id } }"
      />
      <SaTag v-else-if="session.signed_up" color="gray">
        {{ t('pages.sessions.signingUp') }}
      </SaTag>
      <SaEmptyValue v-else />
    </SaSummaryField>
    <SaSummaryField :label="t('pages.sessionDetail.client')">
      <RecordLink
        v-if="session.client_id"
        mono
        truncate
        :name="session.client_id"
        :to="{ name: 'clientDetail', params: { clientId: session.client_id } }"
      />
      <SaEmptyValue v-else />
    </SaSummaryField>
    <!-- How long the session may run, from when it started to when it expires. A session lives
         minutes, so the day is said once under the two times, and in full where it crosses one. -->
    <SaSummaryField :label="t('pages.sessionDetail.lifetime')">
      <i18n-t
        keypath="pages.sessionDetail.lifetimeRange"
        tag="span"
        scope="global"
        class="block tabular-nums"
      >
        <template #start>
          <time :datetime="isoDateTime(session.session_date)">{{ lifetime.start }}</time>
        </template>
        <template #end>
          <time :datetime="isoDateTime(session.expiration_date)">{{ lifetime.end }}</time>
        </template>
      </i18n-t>
      <span v-if="lifetime.day" class="block text-xs text-gray-600">{{ lifetime.day }}</span>
    </SaSummaryField>
  </SaSummaryCard>
</template>
