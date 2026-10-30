<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NoSymbolIcon } from '@heroicons/vue/20/solid'
import { GrantApi, grantIsLive, type GrantDetailResource } from '@/entities/grant'
import { getErrorMessage, isSuccess } from '@/shared/api'
import { useBreadcrumb } from '@/shared/lib'
import {
  ActionsDropdown,
  CommonAlert,
  CommonCard,
  ConfirmDialog,
  LoadingState,
  PageActions,
  type ActionItem
} from '@/shared/ui'
import GrantSummaryPanel from './GrantSummaryPanel.vue'
import GrantRevocationPanel from './GrantRevocationPanel.vue'
import GrantScopesPanel from './GrantScopesPanel.vue'
import GrantAuthorizationPanel from './GrantAuthorizationPanel.vue'

/**
 * One grant: everything it records, and the revocation an operator can make of it while it is live.
 * It holds no collection of its own, so it has no tabs.
 */
const route = useRoute()
const { t } = useI18n()
const api = new GrantApi()
const { setLabel } = useBreadcrumb()

const grantId = computed(() => route.params.grantId as string)

const grant = ref<GrantDetailResource | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
// A grant the cleanup job collected is answered as one this server never held, which is an outcome
// of reading an old link rather than a failure, so it gets its own copy.
const notFound = ref(false)

const revokeOpen = ref(false)
const revokeLoading = ref(false)
const revokeError = ref<string | null>(null)

// Only a live grant is offered for revoking: the server leaves any other as it is, so the action
// would succeed and change nothing.
const actions = computed<ActionItem[]>(() =>
  grant.value && grantIsLive(grant.value)
    ? [{ key: 'revoke', label: t('pages.grantDetail.revoke'), icon: NoSymbolIcon, danger: true }]
    : []
)

function onAction(key: string) {
  if (key === 'revoke') {
    revokeError.value = null
    revokeOpen.value = true
  }
}

async function load(id: string) {
  grant.value = null
  loading.value = true
  error.value = null
  notFound.value = false

  const response = await api.getGrant(id)

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

async function onRevoke() {
  revokeLoading.value = true
  revokeError.value = null

  const response = await api.revokeGrants({ grant_ids: [grantId.value] })

  revokeLoading.value = false
  if (isSuccess(response)) {
    revokeOpen.value = false
    await load(grantId.value)
  } else {
    revokeError.value = getErrorMessage(response)
  }
}

// The grant a token exchange was given links to another grant, which is the same route under
// another identifier.
watch(grantId, load)

onMounted(() => load(grantId.value))
</script>

<template>
  <div>
    <!-- Loading state -->
    <LoadingState v-if="loading" />

    <!-- Collected state -->
    <CommonCard v-else-if="notFound">
      <p class="text-sm text-gray-600">{{ t('pages.grantDetail.notFound') }}</p>
    </CommonCard>

    <!-- Error state -->
    <CommonAlert v-else-if="error" color="danger">
      {{ error }}
    </CommonAlert>

    <!-- Content -->
    <div v-else-if="grant" class="space-y-6">
      <PageActions v-if="actions.length > 0">
        <ActionsDropdown :actions="actions" @action="onAction" />
      </PageActions>
      <GrantSummaryPanel :grant="grant" />
      <GrantRevocationPanel v-if="grant.revoked_at" :grant="grant" />
      <GrantScopesPanel :grant="grant" />
      <GrantAuthorizationPanel :grant="grant" />
    </div>
  </div>

  <ConfirmDialog
    :open="revokeOpen"
    :confirm-label="t('pages.grantDetail.revoke')"
    :loading="revokeLoading"
    :error="revokeError"
    @confirm="onRevoke"
    @cancel="revokeOpen = false"
  >
    <template #title>
      {{ t('pages.grantDetail.revokeTitle') }}
    </template>
    <p class="text-sm text-gray-600">{{ t('pages.grantDetail.revokeDescription') }}</p>
  </ConfirmDialog>
</template>
