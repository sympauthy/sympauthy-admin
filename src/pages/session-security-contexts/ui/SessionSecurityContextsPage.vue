<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  useInteractiveFlowSessionSecurityContextStore,
  securityContextLocation
} from '@/entities/session'
import { CollectionPage, CollectionSortHeader } from '@/shared/collection'
import { EmptyValue, TableCell, TableHeader } from '@/shared/ui'
import { formatDateTime } from '@/shared/lib'

const route = useRoute()
const { t } = useI18n()
const store = useInteractiveFlowSessionSecurityContextStore()

const sessionId = computed(() => route.params.sessionId as string)

// The shell above this route nulls the record before re-reading it, which unmounts this tab and
// mounts it again — so the account is read once, here, and no watcher is needed to follow it.
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
      <TableHeader fit>{{ t('pages.sessionSecurityContexts.ip') }}</TableHeader>
      <TableHeader>{{ t('pages.sessionSecurityContexts.userAgent') }}</TableHeader>
      <CollectionSortHeader
        hidden-below="lg"
        :collection="store.securityContexts"
        :label="t('pages.sessionSecurityContexts.location')"
        field="country_code"
      />
      <CollectionSortHeader
        fit
        :collection="store.securityContexts"
        :label="t('pages.sessionSecurityContexts.requests')"
        field="observation_count"
      />
      <CollectionSortHeader
        fit
        hidden-below="lg"
        :collection="store.securityContexts"
        :label="t('pages.sessionSecurityContexts.firstSeen')"
        field="first_seen_date"
      />
      <CollectionSortHeader
        fit
        hidden-below="sm"
        :collection="store.securityContexts"
        :label="t('pages.sessionSecurityContexts.lastSeen')"
        field="last_seen_date"
      />
      <CollectionSortHeader
        fit
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
        <TableCell primary fit mono>
          {{ context.ip }}
        </TableCell>
        <TableCell :label="t('pages.sessionSecurityContexts.userAgent')" truncate>
          <span v-if="context.user_agent">{{ context.user_agent }}</span>
          <EmptyValue v-else />
        </TableCell>
        <TableCell :label="t('pages.sessionSecurityContexts.location')" truncate hidden-below="lg">
          <span v-if="securityContextLocation(context)">
            {{ securityContextLocation(context) }}
          </span>
          <EmptyValue v-else />
          <div v-if="context.time_zone" class="text-xs text-gray-400">
            {{ context.time_zone }}
          </div>
        </TableCell>
        <TableCell :label="t('pages.sessionSecurityContexts.requests')" fit>
          {{ context.observation_count }}
        </TableCell>
        <TableCell :label="t('pages.sessionSecurityContexts.firstSeen')" fit hidden-below="lg">
          {{ formatDateTime(context.first_seen_date) }}
        </TableCell>
        <TableCell :label="t('pages.sessionSecurityContexts.lastSeen')" fit hidden-below="sm">
          {{ formatDateTime(context.last_seen_date) }}
        </TableCell>
        <!-- Only a place a credential was proven from carries a date. A place without one is
             merely where requests came from, which anybody holding the session's state can
             produce. -->
        <TableCell :label="t('pages.sessionSecurityContexts.proven')" fit>
          <span v-if="context.proven_date">{{ formatDateTime(context.proven_date) }}</span>
          <EmptyValue v-else />
        </TableCell>
      </tr>
    </template>

    <template #empty>
      <p class="text-sm text-gray-600">{{ t('pages.sessionSecurityContexts.empty') }}</p>
    </template>
  </CollectionPage>
</template>
