<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { PlusIcon } from '@heroicons/vue/20/solid'
import { useInvitationStore } from '@/stores/useInvitationStore'
import { useAudienceStore } from '@/stores/useAudienceStore'
import PaginatedTable from '@/components/PaginatedTable.vue'
import FilterBar from '@/components/FilterBar.vue'
import Tag from '@/components/Tag.vue'
import CommonButton from '@/components/CommonButton.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import CreateInvitationDialog from '@/components/CreateInvitationDialog.vue'
import { dangerColoredButton, primaryColoredButton } from '@/styles/ButtonStyle'
import type { FilterConfig } from '@/components/FilterBar.vue'

const { t } = useI18n()
const invitationStore = useInvitationStore()
const audienceStore = useAudienceStore()

const showCreateDialog = ref(false)
const revokeInvitationId = ref<string | null>(null)
const revokeLoading = ref(false)
const revokeError = ref<string | null>(null)

const filters = computed<FilterConfig[]>(() => [
  {
    key: 'status',
    label: t('pages.invitations.statusFilter'),
    type: 'select',
    options: [
      { label: t('pages.invitations.allStatuses'), value: '' },
      { label: t('pages.invitations.pending'), value: 'pending' },
      { label: t('pages.invitations.used'), value: 'used' },
      { label: t('pages.invitations.consumed'), value: 'consumed' },
      { label: t('pages.invitations.revoked'), value: 'revoked' },
      { label: t('pages.invitations.expired'), value: 'expired' }
    ]
  },
  {
    key: 'audience',
    label: t('pages.invitations.audienceFilter'),
    type: 'select',
    options: [
      { label: t('pages.invitations.allAudiences'), value: '' },
      ...audienceStore.audiences.map((a) => ({
        label: a.audience_id,
        value: a.audience_id
      }))
    ]
  }
])

function onFilterChange(key: string, value: string) {
  if (key === 'status') {
    invitationStore.setStatusFilter(value)
  } else if (key === 'audience') {
    invitationStore.setAudienceFilter(value)
  }
}

function onFilterRemove(key: string) {
  if (key === 'status') {
    invitationStore.clearStatusFilter()
  } else if (key === 'audience') {
    invitationStore.clearAudienceFilter()
  }
}

function statusColor(status: string): 'yellow' | 'green' | 'red' | 'gray' {
  switch (status) {
    case 'pending':
      return 'yellow'
    case 'used':
    case 'consumed':
      return 'green'
    case 'revoked':
      return 'red'
    default:
      return 'gray'
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString()
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
    revokeError.value = invitationStore.error
  }

  revokeLoading.value = false
}

function onCancelRevoke() {
  revokeInvitationId.value = null
}

function onInvitationCreated() {
  invitationStore.fetchInvitations(0)
}

onMounted(async () => {
  await Promise.all([audienceStore.fetchAudiences(), invitationStore.fetchInvitations()])
})
</script>

<template>
  <div>
    <div class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <FilterBar
        class="flex-1"
        :filters="filters"
        @filter-change="onFilterChange"
        @filter-remove="onFilterRemove"
      />
      <CommonButton :button-style="primaryColoredButton" @click="showCreateDialog = true">
        <span class="inline-flex items-center gap-1.5">
          <PlusIcon class="size-4 shrink-0" />
          {{ t('pages.invitations.create') }}
        </span>
      </CommonButton>
    </div>

    <PaginatedTable
      :loading="invitationStore.loading"
      :error="invitationStore.error"
      :empty="invitationStore.invitations.length === 0"
      :page="invitationStore.page"
      :total-pages="invitationStore.totalPages"
      @page-change="invitationStore.fetchInvitations"
    >
      <template #header>
        <th
          class="w-0 whitespace-nowrap px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
        >
          {{ t('pages.invitations.status') }}
        </th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.invitations.tokenPrefix') }}
        </th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.invitations.audience') }}
        </th>
        <th
          class="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
        >
          {{ t('pages.invitations.note') }}
        </th>
        <th
          class="hidden sm:table-cell w-0 whitespace-nowrap px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
        >
          {{ t('pages.invitations.expiresAt') }}
        </th>
        <th
          class="w-0 whitespace-nowrap px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
        >
          {{ t('pages.invitations.actions') }}
        </th>
      </template>

      <template #rows>
        <tr v-for="invitation in invitationStore.invitations" :key="invitation.invitation_id">
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
    </PaginatedTable>

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
  </div>
</template>
