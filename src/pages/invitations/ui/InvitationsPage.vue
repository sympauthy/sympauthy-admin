<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { PlusIcon } from '@heroicons/vue/20/solid'
import {
  InvitationApi,
  type InvitationListResource,
  type InvitationResource
} from '@/entities/invitation'
import { getErrorMessage, isSuccess, type ErrorApiResponse } from '@/shared/api'
import { CollectionPage, CollectionSortHeader, useCollection } from '@/features/browse-collection'
import {
  CommonButton,
  ConfirmDialog,
  EmptyValue,
  PageActions,
  TableCell,
  TableHeader,
  Tag,
  dangerColoredButton,
  primaryColoredButton
} from '@/shared/ui'
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
    revokeError.value = getErrorMessage(response as ErrorApiResponse)
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
  <PageActions>
    <CommonButton
      :button-style="primaryColoredButton"
      :label="t('pages.invitations.create')"
      :icon="PlusIcon"
      @click="showCreateDialog = true"
    />
  </PageActions>

  <CollectionPage :collection="invitations" :search-placeholder="t('pages.invitations.search')">
    <template #header>
      <CollectionSortHeader
        fit
        :collection="invitations"
        :label="t('pages.invitations.status')"
        field="status"
      />
      <TableHeader>{{ t('pages.invitations.tokenPrefix') }}</TableHeader>
      <CollectionSortHeader
        :collection="invitations"
        :label="t('pages.invitations.audience')"
        field="audience_id"
      />
      <TableHeader hidden-below="sm">{{ t('pages.invitations.note') }}</TableHeader>
      <CollectionSortHeader
        fit
        hidden-below="sm"
        :collection="invitations"
        :label="t('pages.invitations.expiresAt')"
        field="expires_at"
      />
      <TableHeader fit>{{ t('pages.invitations.actions') }}</TableHeader>
    </template>

    <template #rows>
      <tr v-for="invitation in invitations.items" :key="invitation.invitation_id">
        <TableCell :label="t('pages.invitations.status')" fit>
          <Tag :color="statusColor(invitation.status)">
            {{ t(`pages.invitations.${invitation.status}`) }}
          </Tag>
        </TableCell>
        <TableCell primary mono>
          {{ invitation.token_prefix }}
        </TableCell>
        <TableCell :label="t('pages.invitations.audience')" truncate>
          {{ invitation.audience_id }}
        </TableCell>
        <TableCell :label="t('pages.invitations.note')" truncate hidden-below="sm">
          <span v-if="invitation.note">{{ invitation.note }}</span>
          <EmptyValue v-else />
        </TableCell>
        <TableCell :label="t('pages.invitations.expiresAt')" fit hidden-below="sm">
          <span v-if="invitation.expires_at">{{ formatDate(invitation.expires_at) }}</span>
          <EmptyValue v-else />
        </TableCell>
        <TableCell fit>
          <CommonButton
            v-if="invitation.status === 'pending'"
            :button-style="dangerColoredButton"
            :label="t('pages.invitations.revoke')"
            @click="onRevoke(invitation.invitation_id)"
          />
        </TableCell>
      </tr>
    </template>

    <template #empty>
      <p class="text-sm text-gray-600">{{ t('pages.invitations.empty') }}</p>
    </template>
  </CollectionPage>

  <ConfirmDialog
    :open="revokeInvitationId !== null"
    :confirm-label="t('pages.invitations.revoke')"
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
  </ConfirmDialog>

  <CreateInvitationDialog
    :open="showCreateDialog"
    @close="showCreateDialog = false"
    @created="onInvitationCreated"
  />
</template>
