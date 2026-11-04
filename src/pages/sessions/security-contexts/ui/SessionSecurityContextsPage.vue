<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  InteractiveFlowSessionApi,
  securityContextLocation,
  type InteractiveFlowSessionSecurityContextListResource,
  type InteractiveFlowSessionSecurityContextResource
} from '@/entities/session'
import { CollectionPage, CollectionSortHeader, useCollection } from '@/features/browse-collection'
import { SaEmptyValue, SaTableCell, SaTableHeader } from '@sympauthy/design'
import { formatDateTime } from '@/shared/lib'

const route = useRoute()
const { t } = useI18n()
const api = new InteractiveFlowSessionApi()

const sessionId = computed(() => route.params.sessionId as string)

const securityContexts = useCollection<
  InteractiveFlowSessionSecurityContextResource,
  InteractiveFlowSessionSecurityContextListResource
>({
  capabilities: () => api.getSessionSecurityContextCapabilities(sessionId.value),
  page: (params) => api.listSessionSecurityContexts(sessionId.value, params),
  items: (content) => content.security_contexts
})

// The shell above this route nulls the record before re-reading it, which unmounts this tab and
// mounts it again — so this collection is the mount's own, and follows the record without a watcher
// and with nothing to disown.
onMounted(async () => {
  await securityContexts.fetch()
})
</script>

<template>
  <CollectionPage
    :collection="securityContexts"
    :search-placeholder="t('pages.sessionSecurityContexts.search')"
  >
    <template #header>
      <SaTableHeader fit>{{ t('pages.sessionSecurityContexts.ip') }}</SaTableHeader>
      <SaTableHeader>{{ t('pages.sessionSecurityContexts.userAgent') }}</SaTableHeader>
      <CollectionSortHeader
        hidden-below="lg"
        :collection="securityContexts"
        :label="t('pages.sessionSecurityContexts.location')"
        field="country_code"
      />
      <CollectionSortHeader
        fit
        :collection="securityContexts"
        :label="t('pages.sessionSecurityContexts.requests')"
        field="observation_count"
      />
      <CollectionSortHeader
        fit
        hidden-below="lg"
        :collection="securityContexts"
        :label="t('pages.sessionSecurityContexts.firstSeen')"
        field="first_seen_date"
      />
      <CollectionSortHeader
        fit
        hidden-below="sm"
        :collection="securityContexts"
        :label="t('pages.sessionSecurityContexts.lastSeen')"
        field="last_seen_date"
      />
      <CollectionSortHeader
        fit
        :collection="securityContexts"
        :label="t('pages.sessionSecurityContexts.proven')"
        field="proven_date"
      />
    </template>

    <template #rows>
      <tr
        v-for="context in securityContexts.items"
        :key="`${context.ip}|${context.user_agent ?? ''}`"
      >
        <SaTableCell primary fit mono>
          {{ context.ip }}
        </SaTableCell>
        <SaTableCell :label="t('pages.sessionSecurityContexts.userAgent')" truncate>
          <span v-if="context.user_agent">{{ context.user_agent }}</span>
          <SaEmptyValue v-else />
        </SaTableCell>
        <SaTableCell
          :label="t('pages.sessionSecurityContexts.location')"
          truncate
          hidden-below="lg"
        >
          <span v-if="securityContextLocation(context)">
            {{ securityContextLocation(context) }}
          </span>
          <SaEmptyValue v-else />
          <div v-if="context.time_zone" class="text-xs text-gray-400">
            {{ context.time_zone }}
          </div>
        </SaTableCell>
        <SaTableCell :label="t('pages.sessionSecurityContexts.requests')" fit>
          {{ context.observation_count }}
        </SaTableCell>
        <SaTableCell :label="t('pages.sessionSecurityContexts.firstSeen')" fit hidden-below="lg">
          {{ formatDateTime(context.first_seen_date) }}
        </SaTableCell>
        <SaTableCell :label="t('pages.sessionSecurityContexts.lastSeen')" fit hidden-below="sm">
          {{ formatDateTime(context.last_seen_date) }}
        </SaTableCell>
        <!-- Only a place a credential was proven from carries a date. A place without one is
             merely where requests came from, which anybody holding the session's state can
             produce. -->
        <SaTableCell :label="t('pages.sessionSecurityContexts.proven')" fit>
          <span v-if="context.proven_date">{{ formatDateTime(context.proven_date) }}</span>
          <SaEmptyValue v-else />
        </SaTableCell>
      </tr>
    </template>

    <template #empty>
      <p class="text-sm text-gray-600">{{ t('pages.sessionSecurityContexts.empty') }}</p>
    </template>
  </CollectionPage>
</template>
