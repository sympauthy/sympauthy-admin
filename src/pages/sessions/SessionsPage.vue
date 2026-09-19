<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ArrowPathIcon, EyeIcon } from '@heroicons/vue/20/solid'
import { useInteractiveFlowSessionStore } from '@/entities/session/model/useInteractiveFlowSessionStore'
import ListPage from '@/shared/ui/ListPage.vue'
import SortableHeader from '@/shared/ui/SortableHeader.vue'
import Tag from '@/shared/ui/Tag.vue'
import CommonButton from '@/shared/ui/CommonButton.vue'
import { primaryColoredButton, secondaryColoredButton } from '@/shared/ui/ButtonStyle'
import {
  interactiveFlowPurposes,
  purposeLabel,
  purposeValueLabel
} from '@/entities/session/model/InteractiveFlowPurposeResource'
import {
  interactiveFlowSessionStatuses,
  interactiveFlowSessionStatusColor,
  interactiveFlowSessionStatusLabel
} from '@/entities/session/model/InteractiveFlowSessionSummaryResource'
import { userIdentifierLabel } from '@/entities/user/model/UserResource'
import { formatDateTime } from '@/shared/lib/DateUtils'
import type { FilterConfig } from '@/shared/ui/FilterBar.vue'

const { t } = useI18n()
const router = useRouter()
const sessionStore = useInteractiveFlowSessionStore()

// Status and purpose are the two criteria that are closed sets small enough to enumerate. The
// client is deliberately not one: the endpoint answers 400 on an id naming nothing it holds, and
// the search already spans the client id.
const filters = computed<FilterConfig[]>(() => [
  {
    key: 'status',
    label: t('pages.sessions.statusFilter'),
    type: 'select',
    options: [
      { label: t('pages.sessions.allStatuses'), value: '' },
      ...interactiveFlowSessionStatuses.map((status) => ({
        label: interactiveFlowSessionStatusLabel(status),
        value: status
      }))
    ]
  },
  {
    key: 'purpose',
    label: t('pages.sessions.purposeFilter'),
    type: 'select',
    options: [
      { label: t('pages.sessions.allPurposes'), value: '' },
      ...interactiveFlowPurposes.map((purpose) => ({
        label: purposeValueLabel(purpose),
        value: purpose
      }))
    ]
  }
])

function onFilterChange(key: string, value: string) {
  if (key === 'status') {
    sessionStore.setStatusFilter(value)
  } else if (key === 'purpose') {
    sessionStore.setPurposeFilter(value)
  }
}

function onFilterRemove(key: string) {
  if (key === 'status') {
    sessionStore.clearStatusFilter()
  } else if (key === 'purpose') {
    sessionStore.clearPurposeFilter()
  }
}

onMounted(async () => {
  sessionStore.$reset()
  await sessionStore.fetchSessions()
})
</script>

<template>
  <ListPage
    :loading="sessionStore.loading"
    :error="sessionStore.error"
    :empty="sessionStore.sessions.length === 0"
    :page="sessionStore.page"
    :size="sessionStore.size"
    :total="sessionStore.total"
    :total-pages="sessionStore.totalPages"
    searchable
    :search-placeholder="t('pages.sessions.search')"
    :filters="filters"
    @search="sessionStore.setSearch"
    @filter-change="onFilterChange"
    @filter-remove="onFilterRemove"
    @page-change="sessionStore.fetchSessions"
    @page-size-change="sessionStore.setSize"
  >
    <!-- The set changes while the operator is looking at it, so it is theirs to re-read. -->
    <template #actions>
      <CommonButton
        :button-style="secondaryColoredButton"
        :disabled="sessionStore.loading"
        @click="sessionStore.fetchSessions(sessionStore.page)"
      >
        <span class="inline-flex items-center gap-1.5">
          <ArrowPathIcon class="size-4 shrink-0" />
          {{ t('pages.sessions.refresh') }}
        </span>
      </CommonButton>
    </template>

    <template #header>
      <th
        class="w-0 whitespace-nowrap px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        {{ t('pages.sessions.status') }}
      </th>
      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        {{ t('pages.sessions.user') }}
      </th>
      <th
        class="hidden lg:table-cell w-0 whitespace-nowrap px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        {{ t('pages.sessions.ip') }}
      </th>
      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        {{ t('pages.sessions.client') }}
      </th>
      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        {{ t('pages.sessions.startedFor') }}
      </th>
      <th
        class="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        {{ t('pages.sessions.stoppedAt') }}
      </th>
      <SortableHeader
        class="w-0 whitespace-nowrap hidden sm:table-cell"
        :label="t('pages.sessions.started')"
        field="session_date"
        current-sort="session_date"
        :current-order="sessionStore.order"
        @sort="sessionStore.toggleOrder"
      />
      <th
        class="w-0 whitespace-nowrap px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        {{ t('pages.sessions.actions') }}
      </th>
    </template>

    <template #rows>
      <tr v-for="session in sessionStore.sessions" :key="session.id">
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
  </ListPage>
</template>
