<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useInteractiveFlowSessionDetailStore } from '@/stores/useInteractiveFlowSessionDetailStore'
import { useInteractiveFlowSessionSecurityContextStore } from '@/stores/useInteractiveFlowSessionSecurityContextStore'
import { useBreadcrumb } from '@/shared/lib/useBreadcrumb'
import SessionSummaryPanel from '@/pages/sessiondetail/SessionSummaryPanel.vue'
import SessionFailurePanel from '@/pages/sessiondetail/SessionFailurePanel.vue'
import SessionSecurityContextPanel from '@/pages/sessiondetail/SessionSecurityContextPanel.vue'
import SessionPurposesPanel from '@/pages/sessiondetail/SessionPurposesPanel.vue'
import CommonSpinner from '@/shared/ui/CommonSpinner.vue'
import CommonAlert from '@/shared/ui/CommonAlert.vue'
import { userIdentifierLabel } from '@/client/model/UserResource'

const route = useRoute()
const { t } = useI18n()
const store = useInteractiveFlowSessionDetailStore()
const securityContextStore = useInteractiveFlowSessionSecurityContextStore()
const { setLabel } = useBreadcrumb()

const sessionId = computed(() => route.params.sessionId as string)

onMounted(async () => {
  store.$reset()
  securityContextStore.$reset()
  await Promise.all([
    store.fetchSession(sessionId.value),
    securityContextStore.fetchSecurityContexts(sessionId.value)
  ])
  if (store.session) {
    setLabel(store.session.user ? userIdentifierLabel(store.session.user) : store.session.id)
  }
})
</script>

<template>
  <div>
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
    <div v-else-if="store.session" class="space-y-6">
      <SessionSummaryPanel :session="store.session" />
      <SessionFailurePanel v-if="store.session.status === 'failed'" :session="store.session" />
      <SessionPurposesPanel :session="store.session" />
      <SessionSecurityContextPanel :session-id="sessionId" />
    </div>
  </div>
</template>
