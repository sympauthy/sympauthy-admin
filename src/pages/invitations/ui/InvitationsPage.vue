<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { PlusIcon } from '@heroicons/vue/20/solid'
import { useInvitationStore } from '@/entities/invitation'
import {
  CollectionPage,
  CollectionSortHeader,
  Tag,
  CommonButton,
  ConfirmDialog,
  dangerColoredButton,
  primaryColoredButton
} from '@/shared/ui'
import CreateInvitationDialog from './CreateInvitationDialog.vue'
import { formatDate } from '@/shared/lib'

const { t } = useI18n()
const invitationStore = useInvitationStore()

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

async function onConfirmRevoke() {
  if (!revokeInvitationId.value) return

  revokeLoading.value = true
  revokeError.value = null

  const success = await invitationStore.revokeInvitation(revokeInvitationId.value)

  if (success) {
    revokeInvitationId.value = null
  } else {
    revokeError.value = invitationStore.invitations.error
  }

  revokeLoading.value = false
}

function onCancelRevoke() {
  revokeInvitationId.value = null
}

function onInvitationCreated() {
  invitationStore.invitations.fetch(0)
}

onMounted(async () => {
  await invitationStore.invitations.fetch()
})
</script>

<template>
  <CollectionPage
    :collection="invitationStore.invitations"
    :search-placeholder="t('pages.invitations.search')"
  >
    <template #actions>
      <CommonButton :button-style="primaryColoredButton" @click="showCreateDialog = true">
        <span class="inline-flex items-center gap-1.5">
          <PlusIcon class="size-4 shrink-0" />
          {{ t('pages.invitations.create') }}
        </span>
      </CommonButton>
    </template>

    <template #header>
      <CollectionSortHeader
        class="w-0 whitespace-nowrap"
        :collection="invitationStore.invitations"
        :label="t('pages.invitations.status')"
        field="status"
      />
      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        {{ t('pages.invitations.tokenPrefix') }}
      </th>
      <CollectionSortHeader
        :collection="invitationStore.invitations"
        :label="t('pages.invitations.audience')"
        field="audience_id"
      />
      <th
        class="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        {{ t('pages.invitations.note') }}
      </th>
      <CollectionSortHeader
        class="hidden sm:table-cell w-0 whitespace-nowrap"
        :collection="invitationStore.invitations"
        :label="t('pages.invitations.expiresAt')"
        field="expires_at"
      />
      <th
        class="w-0 whitespace-nowrap px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        {{ t('pages.invitations.actions') }}
      </th>
    </template>

    <template #rows>
      <tr v-for="invitation in invitationStore.invitations.items" :key="invitation.invitation_id">
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <Tag :color="statusColor(invitation.status)">
            {{ t(`pages.invitations.${invitation.status}`) }}
          </Tag>
        </td>
        <td class="px-6 py-4 text-sm">
          <code class="font-medium text-gray-900">{{ invitation.token_prefix }}</code>
        </td>
        <td class="px-6 py-4 text-sm text-gray-500 truncate">
          {{ invitation.audience_id }}
        </td>
        <td class="hidden sm:table-cell px-6 py-4 text-sm text-gray-500 truncate">
          <span v-if="invitation.note">{{ invitation.note }}</span>
          <span v-else class="text-gray-300">&mdash;</span>
        </td>
        <td class="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <span v-if="invitation.expires_at">{{ formatDate(invitation.expires_at) }}</span>
          <span v-else class="text-gray-300">&mdash;</span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <CommonButton
            v-if="invitation.status === 'pending'"
            :button-style="dangerColoredButton"
            @click="onRevoke(invitation.invitation_id)"
          >
            {{ t('pages.invitations.revoke') }}
          </CommonButton>
        </td>
      </tr>
    </template>

    <template #empty>
      <p class="text-gray-600">{{ t('pages.invitations.empty') }}</p>
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
