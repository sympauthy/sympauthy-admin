<script lang="ts" setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  interactiveFlowSessionCarriesFailure,
  interactiveFlowSessionEndedInFailure,
  purposeLabel,
  useInteractiveFlowSessionDetailStore
} from '@/entities/session'
import { formatDateTime, useBreadcrumb } from '@/shared/lib'
import SessionSummaryPanel from './SessionSummaryPanel.vue'
import { SaAlert, SaCard, SaLoadingState } from '@sympauthy/design'
import { type RecordTab, RecordTabs } from '@/shared/ui'

/**
 * One interactive flow session: its summary, and a tab per view below it. Each tab is a route of
 * its own, so the view an operator is on is addressable and survives a reload.
 */
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const store = useInteractiveFlowSessionDetailStore()
const { setLabel } = useBreadcrumb()

const sessionId = computed(() => route.params.sessionId as string)

// A tab names its own view and carries that view's explanation, both read under the route it opens.
// Neither sentence carries a link, so neither declares one.
//
// Why a session ended where it did is a view of its own rather than a panel above the strip: it
// belongs to a session that ended in a failure, and a section held for some would cost every
// session the height it takes. It comes first, since it is the question an operator opens such a
// session with — the record still falls back to the purposes, which every session has.
const tabs = computed<RecordTab[]>(() => {
  const params = { sessionId: sessionId.value }
  const failure =
    store.session && interactiveFlowSessionEndedInFailure(store.session.status)
      ? (['sessionFailure'] as const)
      : []
  const names = ['sessionPurposes', 'sessionSecurityContexts'] as const
  return [...failure, ...names].map((name) => ({
    label: t(`pages.${name}.title`),
    to: { name, params },
    help: `pages.${name}`
  }))
})

async function load(id: string) {
  store.$reset()
  await store.fetchSession(id)
  if (!store.session) {
    return
  }
  // A session is named as its row in the list is, by what it was started for, and told from the
  // others started for the same by when it started. The user it identified is in the summary.
  setLabel(
    t('pages.sessionDetail.label', {
      purpose: purposeLabel(store.session.initiating_purpose),
      started: formatDateTime(store.session.session_date)
    })
  )

  // The record's route falls back to the purposes, which every session has, and it does so before
  // the session has been read. Once it has, one that ended in a failure is moved on to the tab its
  // strip opens with, so the question it was opened with is answered without a click. Only that
  // fallback is replaced — a URL naming a tab is where the operator asked to be, and a reload of
  // one stays there — and only while the session read is still the one on screen.
  //
  // A session the status puts in the failure set but that recorded none of it is left on the
  // purposes: the tab is still offered, but landing on it answers the question with nothing.
  if (
    interactiveFlowSessionEndedInFailure(store.session.status) &&
    interactiveFlowSessionCarriesFailure(store.session) &&
    route.redirectedFrom?.name === 'sessionDetail' &&
    sessionId.value === id
  ) {
    await router.replace({ name: 'sessionFailure', params: { sessionId: id } })
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
    <SaLoadingState v-if="store.loading" :label="t('common.loading')" />

    <!-- Collected state. This is a live view rather than a history, so a session that is gone is
         the expected outcome and reads as one rather than as a failure. -->
    <SaCard v-else-if="store.notFound">
      <p class="text-sm text-gray-600">{{ t('pages.sessionDetail.notFound') }}</p>
    </SaCard>

    <!-- Error state -->
    <SaAlert v-else-if="store.error" color="danger">
      {{ store.error }}
    </SaAlert>

    <!-- Content -->
    <template v-else-if="store.session">
      <SessionSummaryPanel class="shrink-0" :session="store.session" />
      <RecordTabs :tabs="tabs" :label="t('pages.sessionDetail.views')" />
      <!-- The tab fills what the summary and the strip leave, so its table scrolls rather than the
           page. The purposes are shorter than the viewport and scroll inside the same box. -->
      <div class="min-h-0 flex-1 overflow-y-auto">
        <RouterView />
      </div>
    </template>
  </div>
</template>
