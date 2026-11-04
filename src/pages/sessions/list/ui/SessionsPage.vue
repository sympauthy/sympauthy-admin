<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { EyeIcon } from '@heroicons/vue/20/solid'
import {
  InteractiveFlowSessionApi,
  interactiveFlowSessionStatusColor,
  interactiveFlowSessionStatusLabel,
  type InteractiveFlowSessionListResource,
  type InteractiveFlowSessionSummaryResource
} from '@/entities/session'
import { CollectionPage, CollectionSortHeader, useCollection } from '@/features/browse-collection'
import {
  CommonButton,
  DocHelpTooltip,
  RouteLink,
  SaEmptyValue,
  SaTableCell,
  SaTableHeader,
  SaTag
} from '@/shared/ui'
import { userIdentifierLabel } from '@/entities/user'
import { formatDateTime } from '@/shared/lib'

const { t } = useI18n()
const router = useRouter()
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
      <SaTableHeader fit>{{ t('pages.sessions.actions') }}</SaTableHeader>
    </template>

    <template #rows>
      <tr v-for="session in sessions.items" :key="session.id">
        <SaTableCell :label="t('pages.sessions.status')" fit>
          <SaTag :color="interactiveFlowSessionStatusColor(session.status)">
            {{ interactiveFlowSessionStatusLabel(session.status) }}
          </SaTag>
        </SaTableCell>
        <SaTableCell primary truncate>
          <RouteLink
            v-if="session.user"
            block
            :to="{ name: 'userDetail', params: { userId: session.user.user_id } }"
            class="font-medium text-gray-900"
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
        <SaTableCell :label="t('pages.sessions.client')" truncate>
          <span v-if="session.client_id">{{ session.client_id }}</span>
          <SaEmptyValue v-else />
        </SaTableCell>
        <SaTableCell :label="t('pages.sessions.started')" fit hidden-below="lg">
          {{ formatDateTime(session.session_date) }}
        </SaTableCell>
        <SaTableCell fit>
          <CommonButton
            variant="secondary"
            :label="t('pages.sessions.view')"
            :icon="EyeIcon"
            @click="router.push({ name: 'sessionDetail', params: { sessionId: session.id } })"
          />
        </SaTableCell>
      </tr>
    </template>

    <template #empty>
      <p class="max-w-prose text-center text-sm text-gray-600">{{ t('pages.sessions.empty') }}</p>
    </template>
  </CollectionPage>
</template>
