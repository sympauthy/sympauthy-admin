<script lang="ts" setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  useInteractiveFlowSessionSecurityContextStore,
  securityContextLocation
} from '@/entities/session'
import { CollectionPage, CollectionSortHeader } from '@/shared/ui'
import { formatDateTime } from '@/shared/lib'

const route = useRoute()
const { t } = useI18n()
const store = useInteractiveFlowSessionSecurityContextStore()

const sessionId = computed(() => route.params.sessionId as string)

watch(sessionId, (id) => store.fetchSecurityContexts(id))

onMounted(async () => {
  store.$reset()
  await store.fetchSecurityContexts(sessionId.value)
})
</script>

<template>
  <CollectionPage
    :collection="store.securityContexts"
    :search-placeholder="t('pages.sessionSecurityContexts.search')"
  >
    <template #header>
      <th
        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-0 whitespace-nowrap"
      >
        {{ t('pages.sessionSecurityContexts.ip') }}
      </th>
      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        {{ t('pages.sessionSecurityContexts.userAgent') }}
      </th>
      <CollectionSortHeader
        class="hidden lg:table-cell"
        :collection="store.securityContexts"
        :label="t('pages.sessionSecurityContexts.location')"
        field="country_code"
      />
      <CollectionSortHeader
        class="w-0 whitespace-nowrap"
        :collection="store.securityContexts"
        :label="t('pages.sessionSecurityContexts.requests')"
        field="observation_count"
      />
      <CollectionSortHeader
        class="w-0 whitespace-nowrap hidden lg:table-cell"
        :collection="store.securityContexts"
        :label="t('pages.sessionSecurityContexts.firstSeen')"
        field="first_seen_date"
      />
      <CollectionSortHeader
        class="w-0 whitespace-nowrap hidden sm:table-cell"
        :collection="store.securityContexts"
        :label="t('pages.sessionSecurityContexts.lastSeen')"
        field="last_seen_date"
      />
      <CollectionSortHeader
        class="w-0 whitespace-nowrap"
        :collection="store.securityContexts"
        :label="t('pages.sessionSecurityContexts.proven')"
        field="proven_date"
      />
    </template>

    <template #rows>
      <tr
        v-for="context in store.securityContexts.items"
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
      <p class="text-gray-600">{{ t('pages.sessionSecurityContexts.empty') }}</p>
    </template>
  </CollectionPage>
</template>
