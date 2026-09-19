<script lang="ts" setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useInteractiveFlowSessionDetailStore } from '@/entities/session'
import { useBreadcrumb } from '@/shared/lib'
import SessionSummaryPanel from './SessionSummaryPanel.vue'
import SessionFailurePanel from './SessionFailurePanel.vue'
import { CommonSpinner, CommonAlert, RecordTabs, type RecordTab } from '@/shared/ui'
import { userIdentifierLabel } from '@/entities/user'

/**
 * One interactive flow session: its summary, and a tab per view below it. Each tab is a route of
 * its own, so the view an operator is on is addressable and survives a reload.
 */
const route = useRoute()
const { t } = useI18n()
const store = useInteractiveFlowSessionDetailStore()
const { setLabel } = useBreadcrumb()

const sessionId = computed(() => route.params.sessionId as string)

const tabs = computed<RecordTab[]>(() => {
  const params = { sessionId: sessionId.value }
  return [
    { label: t('pages.sessionDetail.purposes'), to: { name: 'sessionPurposes', params } },
    {
      label: t('pages.sessionDetail.securityContexts'),
      to: { name: 'sessionSecurityContexts', params }
    }
  ]
})

async function load(id: string) {
  store.$reset()
  await store.fetchSession(id)
  if (store.session) {
    setLabel(store.session.user ? userIdentifierLabel(store.session.user) : store.session.id)
  }
}

// The shell stays mounted while the operator moves between tabs; only a different session is
// re-read.
watch(sessionId, load)

onMounted(() => load(sessionId.value))
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4">
    <!-- Loading state -->
    <div v-if="store.loading" class="flex items-center gap-2">
      <CommonSpinner class="h-6 w-6 border-4" />
      <span class="text-gray-600">{{ t('common.loading') }}</span>
    </div>

    <!-- Collected state. This is a live view rather than a history, so a session that is gone is
         the expected outcome and reads as one rather than as a failure. -->
    <div v-else-if="store.notFound" class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <p class="text-sm text-gray-600">{{ t('pages.sessionDetail.notFound') }}</p>
    </div>

    <!-- Error state -->
    <CommonAlert v-else-if="store.error" color="danger">
      {{ store.error }}
    </CommonAlert>

    <!-- Content -->
    <template v-else-if="store.session">
      <SessionSummaryPanel class="shrink-0" :session="store.session" />
      <!-- Why a session ended where it did belongs to the record rather than to one of its views,
           so it stays in sight whichever tab is open. -->
      <SessionFailurePanel
        v-if="store.session.status === 'failed'"
        class="shrink-0"
        :session="store.session"
      />
      <RecordTabs :tabs="tabs" />
      <!-- The tab fills what the summary and the strip leave, so its table scrolls rather than the
           page. The purposes are shorter than the viewport and scroll inside the same box. -->
      <div class="min-h-0 flex-1 overflow-y-auto">
        <RouterView />
      </div>
    </template>
  </div>
</template>
