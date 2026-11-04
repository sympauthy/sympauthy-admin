<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { PlusIcon } from '@heroicons/vue/20/solid'
import { InvitationApi } from '../api/InvitationApi'
import type { InvitationListResource } from '../model/InvitationListResource'
import type { InvitationResource } from '../model/InvitationResource'
import { getErrorMessage, isSuccess } from '@/shared/api'
import { CollectionPage, CollectionSortHeader, useCollection } from '@/features/browse-collection'
import {
  SaConfirmDialog,
  SaEmptyValue,
  SaPageActions,
  SaTableCell,
  SaTableHeader,
  SaTag
} from '@sympauthy/design'
import { CommonButton, DocHelpTooltip } from '@/shared/ui'
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
  await invitations.fetch()
})
</script>

<template>
  <SaPageActions>
    <CommonButton
      variant="primary"
      :label="t('pages.invitations.create')"
      :icon="PlusIcon"
      :required-scopes="['admin:invitations:write']"
      @click="showCreateDialog = true"
    />
  </SaPageActions>

  <CollectionPage :collection="invitations" :search-placeholder="t('pages.invitations.search')">
    <template #header>
      <CollectionSortHeader
        fit
        :collection="invitations"
        :label="t('pages.invitations.status.label')"
        field="status"
      >
        <template #help>
          <DocHelpTooltip term="pages.invitations.status" />
        </template>
      </CollectionSortHeader>
      <SaTableHeader>
        {{ t('pages.invitations.tokenPrefix.label') }}
        <DocHelpTooltip term="pages.invitations.tokenPrefix" />
      </SaTableHeader>
      <CollectionSortHeader
        :collection="invitations"
        :label="t('pages.invitations.audience')"
        field="audience_id"
      >
        <template #help>
          <DocHelpTooltip term="terms.audience.id" />
        </template>
      </CollectionSortHeader>
      <SaTableHeader hidden-below="sm">{{ t('pages.invitations.note') }}</SaTableHeader>
      <CollectionSortHeader
        fit
        hidden-below="sm"
        :collection="invitations"
        :label="t('pages.invitations.expiresAt')"
        field="expires_at"
      />
      <SaTableHeader fit>{{ t('pages.invitations.actions') }}</SaTableHeader>
    </template>

    <template #rows>
      <tr v-for="invitation in invitations.items" :key="invitation.invitation_id">
        <SaTableCell :label="t('pages.invitations.status.label')" fit>
          <SaTag :color="statusColor(invitation.status)">
            {{ t(`pages.invitations.${invitation.status}`) }}
          </SaTag>
        </SaTableCell>
        <SaTableCell primary mono>
          {{ invitation.token_prefix }}
        </SaTableCell>
        <SaTableCell :label="t('pages.invitations.audience')" truncate>
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
        <!-- Only a pending invitation can be revoked. Another keeps the height the button would give
             its row, so rows stay one height, and has no empty line to draw below `sm:`. -->
        <SaTableCell fit :hidden-below="invitation.status === 'pending' ? undefined : 'sm'">
          <CommonButton
            v-if="invitation.status === 'pending'"
            variant="secondary"
            :label="t('pages.invitations.revoke')"
            :required-scopes="['admin:invitations:write']"
            @click="onRevoke(invitation.invitation_id)"
          />
          <div v-else class="min-h-control" />
        </SaTableCell>
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
