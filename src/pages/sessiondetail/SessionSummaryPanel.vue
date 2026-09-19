<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import Tag from '@/shared/ui/Tag.vue'
import CopyToClipboard from '@/shared/ui/CopyToClipboard.vue'
import { purposeLabel } from '@/client/model/InteractiveFlowPurposeResource'
import {
  interactiveFlowSessionStatusColor,
  interactiveFlowSessionStatusLabel
} from '@/client/model/InteractiveFlowSessionSummaryResource'
import { userIdentifierLabel } from '@/client/model/UserResource'
import { formatDateTime } from '@/shared/lib/DateUtils'
import type { InteractiveFlowSessionDetailResource } from '@/client/model/InteractiveFlowSessionDetailResource'

defineProps<{
  session: InteractiveFlowSessionDetailResource
}>()

const { t } = useI18n()
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="min-w-0">
        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.sessionDetail.sessionId') }}
        </dt>
        <dd class="mt-1 flex items-center gap-1.5 min-w-0">
          <span class="text-sm text-gray-900 font-mono truncate">{{ session.id }}</span>
          <CopyToClipboard :value="session.id" :title="t('pages.sessionDetail.copySessionId')" />
        </dd>
      </div>
      <div>
        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.sessionDetail.status') }}
        </dt>
        <dd class="mt-1">
          <Tag :color="interactiveFlowSessionStatusColor(session.status)">
            {{ interactiveFlowSessionStatusLabel(session.status) }}
          </Tag>
        </dd>
      </div>
      <div class="min-w-0">
        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.sessionDetail.startedFor') }}
        </dt>
        <dd class="mt-1 text-sm text-gray-900">
          {{ purposeLabel(session.initiating_purpose) }}
        </dd>
      </div>
      <div class="min-w-0">
        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.sessionDetail.client') }}
        </dt>
        <dd class="mt-1 text-sm text-gray-900 font-mono truncate">
          <span v-if="session.client_id">{{ session.client_id }}</span>
          <span v-else class="text-gray-300 font-sans">&mdash;</span>
        </dd>
      </div>
      <div class="min-w-0">
        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.sessionDetail.flow') }}
        </dt>
        <dd class="mt-1 text-sm text-gray-900 font-mono truncate">
          <span v-if="session.flow_id">{{ session.flow_id }}</span>
          <span v-else class="text-gray-300 font-sans">&mdash;</span>
        </dd>
      </div>
      <div class="min-w-0">
        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.sessionDetail.user') }}
        </dt>
        <dd class="mt-1 text-sm truncate">
          <router-link
            v-if="session.user"
            :to="{ name: 'userDetail', params: { userId: session.user.user_id } }"
            class="text-gray-900 hover:underline"
          >
            {{ userIdentifierLabel(session.user) }}
          </router-link>
          <Tag v-else-if="session.signed_up" color="gray">
            {{ t('pages.sessions.signingUp') }}
          </Tag>
          <span v-else class="text-gray-300">&mdash;</span>
        </dd>
      </div>
      <div>
        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.sessionDetail.startedAt') }}
        </dt>
        <dd class="mt-1 text-sm text-gray-900">
          {{ formatDateTime(session.session_date) }}
        </dd>
      </div>
      <div>
        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.sessionDetail.expiresAt') }}
        </dt>
        <dd class="mt-1 text-sm text-gray-900">
          {{ formatDateTime(session.expiration_date) }}
        </dd>
      </div>
    </div>
  </div>
</template>
