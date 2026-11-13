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
import { DocHelpTooltip, RecordLink, TableRecord } from '@/shared/ui'
import { userIdentifierLabel } from '@/entities/user'
import { clientReferenceName } from '@/entities/client'
import { formatDateTime, isoDateTime } from '@/shared/lib'

const { t } = useI18n()
const api = new InteractiveFlowSessionApi()

const sessions = useCollection<
  InteractiveFlowSessionSummaryResource,
  InteractiveFlowSessionListResource
>({
  capabilities: () => api.getSessionCapabilities(),
  page: (params) => api.listSessions(params),
  items: (content) => content.sessions,
  key: (session) => session.id
})

onMounted(async () => {
  await sessions.load()
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
        <!-- A phone reads the user and the client each on a line of its own, under the status, as the
             grant list does: left to wrap, a row's lines would depend on how long its user's
             identifier is, and a row without one would read differently. The package ends that
             phone's first line with a break that the row's gap falls on both sides of, so each line
             after it adds that gap again to read evenly spaced. -->
        <SaTableCell
          :label="t('pages.sessions.user')"
          truncate
          class="max-sm:mt-1 max-sm:basis-full"
        >
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
        </SaTableCell>
        <SaTableCell
          :label="t('pages.sessions.client')"
          truncate
          class="max-sm:mt-1 max-sm:basis-full"
        >
          <RecordLink
            v-if="session.client"
            truncate
            :mono="!session.client.display_name"
            :name="clientReferenceName(session.client)"
            :to="{ name: 'clientDetail', params: { clientId: session.client.id } }"
          />
          <SaEmptyValue v-else />
        </SaTableCell>
        <!-- When a session started is what an operator finds the one a person had by, so it is read
             at every width, on a phone on a line of its own after the client. -->
        <SaTableCell :label="t('pages.sessions.started')" fit class="max-sm:mt-1 max-sm:basis-full">
          <time :datetime="isoDateTime(session.session_date)">
            {{ formatDateTime(session.session_date) }}
          </time>
        </SaTableCell>
      </tr>
    </template>

    <template #empty>
      <p class="max-w-prose text-center text-sm text-gray-600">{{ t('pages.sessions.empty') }}</p>
    </template>
  </CollectionPage>
</template>
