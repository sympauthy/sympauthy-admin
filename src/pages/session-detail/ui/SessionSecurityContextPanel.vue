<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import {
  useInteractiveFlowSessionSecurityContextStore,
  securityContextLocation
} from '@/entities/session'
import { DetailSection, HelpTooltip, PaginatedTable } from '@/shared/ui'
import { formatDateTime } from '@/shared/lib'

defineProps<{
  sessionId: string
}>()

const { t } = useI18n()
const store = useInteractiveFlowSessionSecurityContextStore()
</script>

<template>
  <DetailSection :title="t('pages.sessionDetail.securityContexts')">
    <template #help>
      <HelpTooltip>{{ t('pages.sessionDetail.securityContextsHelp') }}</HelpTooltip>
    </template>

    <PaginatedTable
      :loading="store.loading"
      :error="store.error"
      :empty="store.securityContexts.length === 0"
      :page="store.page"
      :size="store.size"
      :total="store.total"
      :total-pages="store.totalPages"
      @page-change="(page: number) => store.fetchSecurityContexts(sessionId, page)"
    >
      <template #header>
        <th
          class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-0 whitespace-nowrap"
        >
          {{ t('pages.sessionDetail.ip') }}
        </th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.sessionDetail.userAgent') }}
        </th>
        <th
          class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell"
        >
          {{ t('pages.sessionDetail.location') }}
        </th>
        <th
          class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-0 whitespace-nowrap"
        >
          {{ t('pages.sessionDetail.requests') }}
        </th>
        <th
          class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-0 whitespace-nowrap hidden lg:table-cell"
        >
          {{ t('pages.sessionDetail.firstSeen') }}
        </th>
        <th
          class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-0 whitespace-nowrap hidden sm:table-cell"
        >
          {{ t('pages.sessionDetail.lastSeen') }}
        </th>
        <th
          class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-0 whitespace-nowrap"
        >
          {{ t('pages.sessionDetail.proven') }}
        </th>
      </template>

      <template #rows>
        <tr
          v-for="context in store.securityContexts"
          :key="`${context.ip}|${context.user_agent ?? ''}`"
        >
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
            {{ context.ip }}
          </td>
          <td class="px-6 py-4 text-sm text-gray-500 truncate">
            <span v-if="context.user_agent">{{ context.user_agent }}</span>
            <span v-else class="text-gray-300">&mdash;</span>
          </td>
          <td class="px-6 py-4 text-sm text-gray-500 truncate hidden lg:table-cell">
            <span v-if="securityContextLocation(context)">
              {{ securityContextLocation(context) }}
            </span>
            <span v-else class="text-gray-300">&mdash;</span>
            <div v-if="context.time_zone" class="text-xs text-gray-400">
              {{ context.time_zone }}
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ context.observation_count }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
            {{ formatDateTime(context.first_seen_date) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
            {{ formatDateTime(context.last_seen_date) }}
          </td>
          <!-- Only a place a credential was proven from carries a date. A place without one is
               merely where requests came from, which anybody holding the session's state can
               produce. -->
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <span v-if="context.proven_date">{{ formatDateTime(context.proven_date) }}</span>
            <span v-else class="text-gray-300">&mdash;</span>
          </td>
        </tr>
      </template>

      <template #empty>
        <p class="text-gray-600">{{ t('pages.sessionDetail.noSecurityContexts') }}</p>
      </template>
    </PaginatedTable>
  </DetailSection>
</template>
