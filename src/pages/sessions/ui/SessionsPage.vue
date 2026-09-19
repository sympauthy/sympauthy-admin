<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ArrowPathIcon, EyeIcon } from '@heroicons/vue/20/solid'
import {
  useInteractiveFlowSessionStore,
  purposeLabel,
  interactiveFlowSessionStatusColor,
  interactiveFlowSessionStatusLabel
} from '@/entities/session'
import {
  CollectionPage,
  CollectionSortHeader,
  CommonButton,
  EmptyValue,
  TableCell,
  TableHeader,
  Tag,
  primaryColoredButton,
  secondaryColoredButton
} from '@/shared/ui'
import { userIdentifierLabel } from '@/entities/user'
import { formatDateTime } from '@/shared/lib'

const { t } = useI18n()
const router = useRouter()
const sessionStore = useInteractiveFlowSessionStore()

onMounted(async () => {
  sessionStore.sessions.reset()
  await sessionStore.sessions.fetch()
})
</script>

<template>
  <CollectionPage
    :collection="sessionStore.sessions"
    :search-placeholder="t('pages.sessions.search')"
  >
    <!-- The set changes while the operator is looking at it, so it is theirs to re-read. -->
    <template #actions>
      <CommonButton
        :button-style="secondaryColoredButton"
        :label="t('pages.sessions.refresh')"
        :icon="ArrowPathIcon"
        :disabled="sessionStore.sessions.loading"
        @click="sessionStore.sessions.fetch(sessionStore.sessions.page)"
      />
    </template>

    <template #header>
      <CollectionSortHeader
        fit
        :collection="sessionStore.sessions"
        :label="t('pages.sessions.status')"
        field="status"
      />
      <TableHeader>{{ t('pages.sessions.user') }}</TableHeader>
      <TableHeader fit hidden-below="lg">{{ t('pages.sessions.ip') }}</TableHeader>
      <CollectionSortHeader
        :collection="sessionStore.sessions"
        :label="t('pages.sessions.client')"
        field="client"
      />
      <CollectionSortHeader
        :collection="sessionStore.sessions"
        :label="t('pages.sessions.startedFor')"
        field="purpose"
      />
      <TableHeader hidden-below="sm">{{ t('pages.sessions.stoppedAt') }}</TableHeader>
      <CollectionSortHeader
        fit
        hidden-below="sm"
        :collection="sessionStore.sessions"
        :label="t('pages.sessions.started')"
        field="session_date"
      />
      <TableHeader fit>{{ t('pages.sessions.actions') }}</TableHeader>
    </template>

    <template #rows>
      <tr v-for="session in sessionStore.sessions.items" :key="session.id">
        <TableCell :label="t('pages.sessions.status')" fit>
          <Tag :color="interactiveFlowSessionStatusColor(session.status)">
            {{ interactiveFlowSessionStatusLabel(session.status) }}
          </Tag>
        </TableCell>
        <TableCell :label="t('pages.sessions.user')" truncate>
          <router-link
            v-if="session.user"
            :to="{ name: 'userDetail', params: { userId: session.user.user_id } }"
            class="font-medium text-gray-900 hover:underline"
          >
            {{ userIdentifierLabel(session.user) }}
          </router-link>
          <Tag v-else-if="session.signed_up" color="gray">
            {{ t('pages.sessions.signingUp') }}
          </Tag>
          <EmptyValue v-else />
        </TableCell>
        <TableCell :label="t('pages.sessions.ip')" fit mono hidden-below="lg">
          <span v-if="session.ip">{{ session.ip }}</span>
          <EmptyValue v-else />
        </TableCell>
        <!-- Plain text rather than a link: a live session may name a client the configuration no
             longer declares, and a link landing on an error page is worse than no link. -->
        <TableCell :label="t('pages.sessions.client')" truncate>
          <span v-if="session.client_id">{{ session.client_id }}</span>
          <EmptyValue v-else />
        </TableCell>
        <TableCell :label="t('pages.sessions.startedFor')" truncate>
          {{ purposeLabel(session.initiating_purpose) }}
        </TableCell>
        <TableCell :label="t('pages.sessions.stoppedAt')" truncate hidden-below="sm">
          <span v-if="session.current_purpose">{{ purposeLabel(session.current_purpose) }}</span>
          <EmptyValue v-else />
        </TableCell>
        <TableCell :label="t('pages.sessions.started')" fit hidden-below="sm">
          {{ formatDateTime(session.session_date) }}
        </TableCell>
        <TableCell fit>
          <CommonButton
            :button-style="primaryColoredButton"
            :label="t('pages.sessions.view')"
            :icon="EyeIcon"
            @click="router.push({ name: 'sessionDetail', params: { sessionId: session.id } })"
          />
        </TableCell>
      </tr>
    </template>

    <template #empty>
      <p class="max-w-prose text-center text-sm text-gray-600">{{ t('pages.sessions.empty') }}</p>
    </template>
  </CollectionPage>
</template>
