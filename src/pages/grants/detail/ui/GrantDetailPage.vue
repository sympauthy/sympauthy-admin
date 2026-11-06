<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { InformationCircleIcon, NoSymbolIcon } from '@heroicons/vue/20/solid'
import { GrantApi, grantIsLive, type GrantDetailResource } from '@/entities/grant'
import { getErrorMessage, isSuccess } from '@/shared/api'
import { useBreadcrumb, useIsPhone } from '@/shared/lib'
import { SaAlert, SaCard, SaLoadingState, SaPageActions } from '@sympauthy/design'
import { RevokeGrantDialog } from '@/features/revoke-grant'
import { type ActionItem, ActionsDropdown } from '@/shared/ui'
import GrantSummaryPanel from './GrantSummaryPanel.vue'
import GrantScopesPanel from './GrantScopesPanel.vue'
import GrantAuthorizationPanel from './GrantAuthorizationPanel.vue'
import GrantTimelinePanel from './GrantTimelinePanel.vue'

/**
 * One grant: everything it records, and the revocation an operator can make of it while it is live.
 * It holds no collection of its own, so it has no tabs.
 */
const route = useRoute()
const { t } = useI18n()
const api = new GrantApi()
const { setLabel } = useBreadcrumb()
const isPhone = useIsPhone()

const grantId = computed(() => route.params.grantId as string)

const grant = ref<GrantDetailResource | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
// A grant the cleanup job collected is answered as one this server never held, which is an outcome
// of reading an old link rather than a failure, so it gets its own copy.
const notFound = ref(false)

// The grant revoked is the one the operator read and confirmed, whatever the URL has moved to.
const revokeGrantId = ref<string | null>(null)

// A phone draws no help beside the status, so the menu links to what a grant is, first. Only a live
// grant is offered for revoking: the server leaves any other as it is, so the action would succeed
// and change nothing.
const actions = computed<ActionItem[]>(() => {
  const live = grant.value !== null && grantIsLive(grant.value)
  return [
    ...(isPhone.value
      ? [{ key: 'help', label: t('pages.grantDetail.about'), icon: InformationCircleIcon }]
      : []),
    ...(live
      ? [
          {
            key: 'revoke',
            label: t('pages.grantDetail.revoke'),
            icon: NoSymbolIcon,
            danger: true,
            startsGroup: isPhone.value,
            requiredScopes: ['admin:grants:write']
          }
        ]
      : [])
  ]
})

function onAction(key: string) {
  if (key === 'help') {
    window.open(t('terms.grant.status.helpLinkUrl'), '_blank', 'noopener,noreferrer')
  } else if (key === 'revoke' && grant.value) {
    revokeGrantId.value = grant.value.grant_id
  }
}

async function load(id: string) {
  grant.value = null
  loading.value = true
  error.value = null
  notFound.value = false

  const response = await api.getGrant(id)

  // Following a grant's acting grant and coming back can leave two reads in flight; only the one for
  // the grant the URL names now is painted, or the page would show one grant under another's path.
  if (id !== grantId.value) {
    return
  }

  if (isSuccess(response)) {
    grant.value = response.content
    setLabel(grant.value.grant_id)
  } else if (response.response?.status === 404) {
    notFound.value = true
  } else {
    error.value = getErrorMessage(response)
  }

  loading.value = false
}

// The grant a token exchange was given links to another grant, which is the same route under
// another identifier.
watch(grantId, load)

onMounted(() => load(grantId.value))
</script>

<template>
  <div>
    <!-- Loading state -->
    <SaLoadingState v-if="loading" :label="t('common.loading')" />

    <!-- Collected state -->
    <SaCard v-else-if="notFound">
      <p class="text-sm text-gray-600">{{ t('pages.grantDetail.notFound') }}</p>
    </SaCard>

    <!-- Error state -->
    <SaAlert v-else-if="error" color="danger">
      {{ error }}
    </SaAlert>

    <!-- Content -->
    <div v-else-if="grant" class="space-y-6">
      <SaPageActions v-if="actions.length > 0">
        <ActionsDropdown :actions="actions" @action="onAction" />
      </SaPageActions>
      <GrantSummaryPanel :grant="grant" />
      <!-- What the grant holds, and beside it from lg: what happened to it; a narrower screen reads
           the timeline last. -->
      <div class="grid gap-6 lg:grid-cols-3 lg:items-start">
        <div class="space-y-6 lg:col-span-2">
          <GrantScopesPanel :grant="grant" />
          <GrantAuthorizationPanel :grant="grant" />
        </div>
        <GrantTimelinePanel :grant="grant" />
      </div>
    </div>
  </div>

  <RevokeGrantDialog
    :grant-id="revokeGrantId"
    @revoked="load(grantId)"
    @close="revokeGrantId = null"
  />
</template>
