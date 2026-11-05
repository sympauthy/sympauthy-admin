<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  InteractiveFlowSessionApi,
  interactiveFlowSessionStatusColor,
  interactiveFlowSessionStatusLabel,
  purposeLabel,
  type InteractiveFlowSessionListResource,
  type InteractiveFlowSessionSummaryResource
} from '@/entities/session'
import { CollectionPage, CollectionSortHeader, useCollection } from '@/features/browse-collection'
import { SaEmptyValue, SaTableCell, SaTableHeader, SaTag } from '@sympauthy/design'
import { DocHelpTooltip, RouteLink, TableRecord } from '@/shared/ui'
import { userIdentifierLabel } from '@/entities/user'
import { formatDateTime } from '@/shared/lib'

const { t } = useI18n()
const api = new InteractiveFlowSessionApi()

const sessions = useCollection<
  InteractiveFlowSessionSummaryResource,
  InteractiveFlowSessionListResource
>({
  capabilities: () => api.getSessionCapabilities(),
  page: (params) => api.listSessions(params),
  items: (content) => content.sessions
})

onMounted(async () => {
  await sessions.fetch()
})
</script>

<template>
  <CollectionPage :collection="sessions" :search-placeholder="t('pages.sessions.search')">
    <template #header>
      <CollectionSortHeader
        :collection="sessions"
        :label="t('pages.sessions.session')"
        field="purpose"
      />
      <CollectionSortHeader
        fit
        :collection="sessions"
        :label="t('pages.sessions.status')"
        field="status"
      >
        <template #help>
          <DocHelpTooltip term="terms.interactiveFlowSession.status" />
        </template>
      </CollectionSortHeader>
      <SaTableHeader>
        {{ t('pages.sessions.user') }}
        <DocHelpTooltip term="terms.interactiveFlowSession.user" />
      </SaTableHeader>
      <CollectionSortHeader
        :collection="sessions"
        :label="t('pages.sessions.client')"
        field="client"
      />
      <CollectionSortHeader
        fit
        hidden-below="lg"
        :collection="sessions"
        :label="t('pages.sessions.started')"
        field="session_date"
      />
    </template>

    <template #rows>
      <tr v-for="session in sessions.items" :key="session.id">
        <SaTableCell primary truncate>
          <TableRecord
            :name="purposeLabel(session.initiating_purpose)"
            :detail="session.id"
            :to="{ name: 'sessionDetail', params: { sessionId: session.id } }"
          />
        </SaTableCell>
        <SaTableCell :label="t('pages.sessions.status')" label-hidden fit>
          <SaTag :color="interactiveFlowSessionStatusColor(session.status)">
            {{ interactiveFlowSessionStatusLabel(session.status) }}
          </SaTag>
        </SaTableCell>
        <SaTableCell :label="t('pages.sessions.user')" truncate>
          <RouteLink
            v-if="session.user"
            block
            :to="{ name: 'userDetail', params: { userId: session.user.user_id } }"
            class="text-gray-900"
          >
            {{ userIdentifierLabel(session.user) }}
          </RouteLink>
          <SaTag v-else-if="session.signed_up" color="gray">
            {{ t('pages.sessions.signingUp') }}
          </SaTag>
          <SaEmptyValue v-else />
        </SaTableCell>
        <!-- Plain text rather than a link: a live session may name a client the configuration no
             longer declares, and a link landing on an error page is worse than no link. -->
        <SaTableCell :label="t('pages.sessions.client')" truncate mono>
          <span v-if="session.client_id">{{ session.client_id }}</span>
          <SaEmptyValue v-else />
        </SaTableCell>
        <SaTableCell :label="t('pages.sessions.started')" fit hidden-below="lg">
          {{ formatDateTime(session.session_date) }}
        </SaTableCell>
      </tr>
    </template>

    <template #empty>
      <p class="max-w-prose text-center text-sm text-gray-600">{{ t('pages.sessions.empty') }}</p>
    </template>
  </CollectionPage>
</template>
