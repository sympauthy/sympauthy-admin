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
import { CollectionPage, useCollection } from '@/features/browse-collection'
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
      <SaTableHeader
        :sorting="sessions.sort"
        field="purpose"
        :filtered-label="sessions.filteredLabel('purpose')"
      >
        {{ t('pages.sessions.session') }}
      </SaTableHeader>
      <SaTableHeader
        fit
        :sorting="sessions.sort"
        field="status"
        :filtered-label="sessions.filteredLabel('status')"
      >
        {{ t('pages.sessions.status') }}
        <template #help>
          <DocHelpTooltip term="terms.interactiveFlowSession.status" />
        </template>
      </SaTableHeader>
      <SaTableHeader>
        {{ t('pages.sessions.user') }}
        <DocHelpTooltip term="terms.interactiveFlowSession.user" />
      </SaTableHeader>
      <SaTableHeader
        :sorting="sessions.sort"
        field="client"
        :filtered-label="sessions.filteredLabel('client')"
      >
        {{ t('pages.sessions.client') }}
      </SaTableHeader>
      <SaTableHeader
        fit
        hidden-below="lg"
        :sorting="sessions.sort"
        field="session_date"
        :filtered-label="sessions.filteredLabel('session_date')"
      >
        {{ t('pages.sessions.started') }}
      </SaTableHeader>
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
        <SaTableCell :label="t('pages.sessions.client')" truncate mono>
          <RouteLink
            v-if="session.client_id"
            block
            :to="{ name: 'clientDetail', params: { clientId: session.client_id } }"
            class="text-gray-900"
          >
            {{ session.client_id }}
          </RouteLink>
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
