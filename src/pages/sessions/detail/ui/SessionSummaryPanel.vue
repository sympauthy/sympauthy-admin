<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import {
  SaCopyableValue,
  SaEmptyValue,
  SaSummaryCard,
  SaSummaryField,
  SaTag
} from '@sympauthy/design'
import { DocHelpTooltip, RouteLink } from '@/shared/ui'
import {
  purposeLabel,
  interactiveFlowSessionStatusColor,
  interactiveFlowSessionStatusLabel,
  type InteractiveFlowSessionDetailResource
} from '@/entities/session'
import { userIdentifierLabel } from '@/entities/user'
import { formatDateTime } from '@/shared/lib'

defineProps<{
  session: InteractiveFlowSessionDetailResource
}>()

const { t } = useI18n()
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
    <SaSummaryField :label="t('pages.sessionDetail.startedFor')">
      <template #help>
        <DocHelpTooltip term="terms.interactiveFlowPurpose" />
      </template>
      {{ purposeLabel(session.initiating_purpose) }}
    </SaSummaryField>
    <SaSummaryField mono :label="t('pages.sessionDetail.client')">
      <span v-if="session.client_id">{{ session.client_id }}</span>
      <SaEmptyValue v-else />
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
      <RouteLink
        v-if="session.user"
        :to="{ name: 'userDetail', params: { userId: session.user.user_id } }"
      >
        {{ userIdentifierLabel(session.user) }}
      </RouteLink>
      <SaTag v-else-if="session.signed_up" color="gray">
        {{ t('pages.sessions.signingUp') }}
      </SaTag>
      <SaEmptyValue v-else />
    </SaSummaryField>
    <SaSummaryField :label="t('pages.sessionDetail.startedAt')">
      {{ formatDateTime(session.session_date) }}
    </SaSummaryField>
    <SaSummaryField :label="t('pages.sessionDetail.expiresAt')">
      {{ formatDateTime(session.expiration_date) }}
    </SaSummaryField>
  </SaSummaryCard>
</template>
