<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { CopyableValue, EmptyValue, SummaryCard, SummaryField, Tag } from '@/shared/ui'
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
  <SummaryCard>
    <SummaryField mono :label="t('pages.sessionDetail.sessionId')">
      <CopyableValue :value="session.id" :title="t('pages.sessionDetail.copySessionId')" />
    </SummaryField>
    <SummaryField :label="t('pages.sessionDetail.status')">
      <Tag :color="interactiveFlowSessionStatusColor(session.status)">
        {{ interactiveFlowSessionStatusLabel(session.status) }}
      </Tag>
    </SummaryField>
    <SummaryField :label="t('pages.sessionDetail.startedFor')">
      {{ purposeLabel(session.initiating_purpose) }}
    </SummaryField>
    <SummaryField mono :label="t('pages.sessionDetail.client')">
      <span v-if="session.client_id">{{ session.client_id }}</span>
      <EmptyValue v-else />
    </SummaryField>
    <SummaryField mono :label="t('pages.sessionDetail.flow')">
      <span v-if="session.flow_id">{{ session.flow_id }}</span>
      <EmptyValue v-else />
    </SummaryField>
    <SummaryField :label="t('pages.sessionDetail.user')">
      <router-link
        v-if="session.user"
        :to="{ name: 'userDetail', params: { userId: session.user.user_id } }"
        class="hover:underline"
      >
        {{ userIdentifierLabel(session.user) }}
      </router-link>
      <Tag v-else-if="session.signed_up" color="gray">
        {{ t('pages.sessions.signingUp') }}
      </Tag>
      <EmptyValue v-else />
    </SummaryField>
    <SummaryField :label="t('pages.sessionDetail.startedAt')">
      {{ formatDateTime(session.session_date) }}
    </SummaryField>
    <SummaryField :label="t('pages.sessionDetail.expiresAt')">
      {{ formatDateTime(session.expiration_date) }}
    </SummaryField>
  </SummaryCard>
</template>
