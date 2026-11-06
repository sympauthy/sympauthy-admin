<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { PlusIcon } from '@heroicons/vue/20/solid'
import { InvitationApi } from '../api/InvitationApi'
import type { InvitationListResource } from '../model/InvitationListResource'
import type { InvitationResource } from '../model/InvitationResource'
import { getErrorMessage, isSuccess } from '@/shared/api'
import { CollectionPage, useCollection } from '@/features/browse-collection'
import {
  SaConfirmDialog,
  SaEmptyValue,
  SaPageActions,
  SaTableActions,
  SaTableCell,
  SaTableHeader,
  SaTag
} from '@sympauthy/design'
import { type ActionItem, ActionsDropdown, CommonButton, DocHelpTooltip } from '@/shared/ui'
import CreateInvitationDialog from './CreateInvitationDialog.vue'
import { formatDate } from '@/shared/lib'

const { t } = useI18n()
const api = new InvitationApi()

const invitations = useCollection<InvitationResource, InvitationListResource>({
  capabilities: () => api.getInvitationCapabilities(),
  page: (params) => api.listInvitations(params),
  items: (content) => content.invitations
})

const showCreateDialog = ref(false)
const pageActions = computed<ActionItem[]>(() => [
  {
    key: 'create',
    label: t('pages.invitations.create'),
    icon: PlusIcon,
    requiredScopes: ['admin:invitations:write']
  }
])
const actions = computed<ActionItem[]>(() => [
  {
    key: 'revoke',
    label: t('pages.invitations.revoke'),
    danger: true,
    requiredScopes: ['admin:invitations:write']
  }
])

const revokeInvitationId = ref<string | null>(null)
const revokeLoading = ref(false)
const revokeError = ref<string | null>(null)

function statusColor(status: string): 'yellow' | 'green' | 'red' | 'gray' {
  switch (status) {
    case 'pending':
      return 'yellow'
    case 'consumed':
      return 'green'
    case 'revoked':
      return 'red'
    default:
      return 'gray'
  }
}

function onRevoke(invitationId: string) {
  revokeInvitationId.value = invitationId
  revokeLoading.value = false
  revokeError.value = null
}

// The list is read again at the page it is displaying rather than from the first, so revoking the
// last invitation of a page does not send the operator back to the top of the list.
async function onConfirmRevoke() {
  if (!revokeInvitationId.value) return

  revokeLoading.value = true
  revokeError.value = null

  const response = await api.revokeInvitation(revokeInvitationId.value)

  if (isSuccess(response)) {
    revokeInvitationId.value = null
    await invitations.fetch(invitations.page)
  } else {
    revokeError.value = getErrorMessage(response)
  }

  revokeLoading.value = false
}

function onCancelRevoke() {
  revokeInvitationId.value = null
}

// A new invitation is the newest record of the collection, which is the first page of it.
function onInvitationCreated() {
  invitations.fetch(0)
}

onMounted(async () => {
  await invitations.load()
})
</script>

<template>
  <SaPageActions>
    <ActionsDropdown :actions="pageActions" @action="showCreateDialog = true">
      <template #expanded>
        <CommonButton
          variant="primary"
          :label="t('pages.invitations.create')"
          :icon="PlusIcon"
          :required-scopes="['admin:invitations:write']"
          @click="showCreateDialog = true"
        />
      </template>
    </ActionsDropdown>
  </SaPageActions>

  <CollectionPage :collection="invitations" :search-placeholder="t('pages.invitations.search')">
    <template #header>
      <SaTableHeader>
        {{ t('pages.invitations.tokenPrefix.label') }}
        <DocHelpTooltip term="pages.invitations.tokenPrefix" />
      </SaTableHeader>
      <SaTableHeader
        fit
        :sorting="invitations.sort"
        field="status"
        :filtered-label="invitations.filteredLabel('status')"
      >
        {{ t('pages.invitations.status.label') }}
        <template #help>
          <DocHelpTooltip term="pages.invitations.status" />
        </template>
      </SaTableHeader>
      <SaTableHeader
        :sorting="invitations.sort"
        field="audience_id"
        :filtered-label="invitations.filteredLabel('audience_id')"
      >
        {{ t('pages.invitations.audience') }}
        <template #help>
          <DocHelpTooltip term="terms.audience.id" />
        </template>
      </SaTableHeader>
      <SaTableHeader hidden-below="sm">{{ t('pages.invitations.note') }}</SaTableHeader>
      <SaTableHeader
        fit
        hidden-below="sm"
        :sorting="invitations.sort"
        field="expires_at"
        :filtered-label="invitations.filteredLabel('expires_at')"
      >
        {{ t('pages.invitations.expiresAt') }}
      </SaTableHeader>
      <SaTableHeader fit>
        <span class="sr-only">{{ t('pages.invitations.actions') }}</span>
      </SaTableHeader>
    </template>

    <template #rows>
      <tr v-for="invitation in invitations.items" :key="invitation.invitation_id">
        <SaTableCell primary truncate mono>
          {{ invitation.token_prefix }}<span class="text-gray-400">…</span>
        </SaTableCell>
        <SaTableCell :label="t('pages.invitations.status.label')" label-hidden fit>
          <SaTag :color="statusColor(invitation.status)">
            {{ t(`pages.invitations.${invitation.status}`) }}
          </SaTag>
        </SaTableCell>
        <SaTableCell :label="t('pages.invitations.audience')" truncate mono>
          {{ invitation.audience_id }}
        </SaTableCell>
        <SaTableCell :label="t('pages.invitations.note')" truncate hidden-below="sm">
          <span v-if="invitation.note">{{ invitation.note }}</span>
          <SaEmptyValue v-else />
        </SaTableCell>
        <SaTableCell :label="t('pages.invitations.expiresAt')" fit hidden-below="sm">
          <span v-if="invitation.expires_at">{{ formatDate(invitation.expires_at) }}</span>
          <SaEmptyValue v-else />
        </SaTableCell>
        <!-- Only a pending invitation can be revoked, and another leaves the cell empty. -->
        <SaTableActions>
          <ActionsDropdown
            v-if="invitation.status === 'pending'"
            :record="invitation.token_prefix"
            :actions="actions"
            @action="onRevoke(invitation.invitation_id)"
          />
        </SaTableActions>
      </tr>
    </template>

    <template #empty>
      <p class="text-sm text-gray-600">{{ t('pages.invitations.empty') }}</p>
    </template>
  </CollectionPage>

  <SaConfirmDialog
    :open="revokeInvitationId !== null"
    :confirm-label="t('pages.invitations.revokeConfirm')"
    :cancel-label="t('common.cancel')"
    :loading="revokeLoading"
    :error="revokeError"
    @confirm="onConfirmRevoke"
    @cancel="onCancelRevoke"
  >
    <template #title>
      {{ t('pages.invitations.revokeTitle') }}
    </template>
    <p class="text-sm text-gray-600">
      {{ t('pages.invitations.revokeDescription') }}
    </p>
  </SaConfirmDialog>

  <CreateInvitationDialog
    :open="showCreateDialog"
    @close="showCreateDialog = false"
    @created="onInvitationCreated"
  />
</template>
