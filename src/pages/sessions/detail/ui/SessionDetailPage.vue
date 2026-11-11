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
import { formatDateTime, useBreadcrumb, useIsPhone } from '@/shared/lib'
import SessionSummaryPanel from './SessionSummaryPanel.vue'
import { SaAlert, SaCard, SaLoadingState, SaPageActions } from '@sympauthy/design'
import { type ActionItem, ActionsDropdown, RecordTabs } from '@/shared/ui'
import { InformationCircleIcon } from '@heroicons/vue/20/solid'
import { useInteractiveFlowSessionViews } from '../model/useInteractiveFlowSessionViews'

/**
 * One interactive flow session: its summary, and a tab per view below it. Each tab is a route of
 * its own, so the view an operator is on is addressable and survives a reload.
 *
 * A phone has no room for the summary, the tabs and a view together, so it opens on the summary and
 * a list of the views, and each view fills a screen of its own.
 */
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const store = useInteractiveFlowSessionDetailStore()
const { setLabel } = useBreadcrumb()
const isPhone = useIsPhone()
const views = useInteractiveFlowSessionViews()

const sessionId = computed(() => route.params.sessionId as string)

const isOverview = computed(() => route.name === 'sessionDetail')
// What explains the view on screen, which a phone reads from the menu: it has no tab to draw it beside.
const help = computed(() =>
  isPhone.value ? views.value.find(({ name }) => name === route.name)?.help : undefined
)
const actions = computed<ActionItem[]>(() =>
  help.value ? [{ key: 'help', label: t(`${help.value}.about`), icon: InformationCircleIcon }] : []
)

function onAction(key: string) {
  if (key === 'help') {
    window.open(t(`${help.value}.helpLinkUrl`), '_blank', 'noopener,noreferrer')
  }
}

// The route opens the purposes on a wider screen, and this does the same for a phone turned or a
// window widened while the list of views is open.
watch([isPhone, isOverview], ([phone, overview]) => {
  if (!phone && overview) {
    router.replace({ name: 'sessionPurposes', params: route.params })
  }
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

  // From sm: the record's route falls back to the purposes, which every session has, and it does so
  // before the session has been read. Once it has, one that ended in a failure is moved on to the
  // tab its strip opens with, so the question it was opened with is answered without a click. A
  // phone lands on the list of views, which names the failure first. Only that
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
      <SaPageActions v-if="actions.length > 0">
        <ActionsDropdown :actions="actions" @action="onAction" />
      </SaPageActions>
      <SessionSummaryPanel
        v-if="!isPhone || isOverview"
        class="shrink-0"
        :session="store.session"
      />
      <RecordTabs v-if="!isPhone" :tabs="views" :label="t('pages.sessionDetail.views')" />
      <!-- From sm: the tab fills what the summary and the strip leave, so its table scrolls rather
           than the page, and the purposes scroll inside the same box. A phone's view is a screen of
           its own, which the page scrolls. -->
      <div class="min-h-0 flex-1 sm:overflow-y-auto">
        <RouterView />
      </div>
    </template>
  </div>
</template>
