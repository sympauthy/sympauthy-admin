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
  Tag,
  CommonButton,
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
        :disabled="sessionStore.sessions.loading"
        @click="sessionStore.sessions.fetch(sessionStore.sessions.page)"
      >
        <span class="inline-flex items-center gap-1.5">
          <ArrowPathIcon class="size-4 shrink-0" />
          {{ t('pages.sessions.refresh') }}
        </span>
      </CommonButton>
    </template>

    <template #header>
      <CollectionSortHeader
        class="w-0 whitespace-nowrap"
        :collection="sessionStore.sessions"
        :label="t('pages.sessions.status')"
        field="status"
      />
      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        {{ t('pages.sessions.user') }}
      </th>
      <th
        class="hidden lg:table-cell w-0 whitespace-nowrap px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        {{ t('pages.sessions.ip') }}
      </th>
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
      <th
        class="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        {{ t('pages.sessions.stoppedAt') }}
      </th>
      <CollectionSortHeader
        class="w-0 whitespace-nowrap hidden sm:table-cell"
        :collection="sessionStore.sessions"
        :label="t('pages.sessions.started')"
        field="session_date"
      />
      <th
        class="w-0 whitespace-nowrap px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        {{ t('pages.sessions.actions') }}
      </th>
    </template>

    <template #rows>
      <tr v-for="session in sessionStore.sessions.items" :key="session.id">
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <Tag :color="interactiveFlowSessionStatusColor(session.status)">
            {{ interactiveFlowSessionStatusLabel(session.status) }}
          </Tag>
        </td>
        <td class="px-6 py-4 text-sm truncate">
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
          <span v-else class="text-gray-300">&mdash;</span>
        </td>
        <td
          class="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono"
        >
          <span v-if="session.ip">{{ session.ip }}</span>
          <span v-else class="text-gray-300">&mdash;</span>
        </td>
        <!-- Plain text rather than a link: a live session may name a client the configuration no
             longer declares, and a link landing on an error page is worse than no link. -->
        <td class="px-6 py-4 text-sm text-gray-500 truncate">
          <span v-if="session.client_id">{{ session.client_id }}</span>
          <span v-else class="text-gray-300">&mdash;</span>
        </td>
        <td class="px-6 py-4 text-sm text-gray-500 truncate">
          {{ purposeLabel(session.initiating_purpose) }}
        </td>
        <td class="hidden sm:table-cell px-6 py-4 text-sm text-gray-500 truncate">
          <span v-if="session.current_purpose">{{ purposeLabel(session.current_purpose) }}</span>
          <span v-else class="text-gray-300">&mdash;</span>
        </td>
        <td class="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {{ formatDateTime(session.session_date) }}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <CommonButton
            :button-style="primaryColoredButton"
            @click="router.push({ name: 'sessionDetail', params: { sessionId: session.id } })"
          >
            <span class="inline-flex items-center gap-1.5">
              <EyeIcon class="size-4 shrink-0" />
              <span class="hidden sm:inline">{{ t('pages.sessions.view') }}</span>
            </span>
          </CommonButton>
        </td>
      </tr>
    </template>

    <template #empty>
      <p class="text-gray-600 max-w-prose text-center">{{ t('pages.sessions.empty') }}</p>
    </template>
  </CollectionPage>
</template>
