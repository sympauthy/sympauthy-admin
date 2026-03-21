<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserMfaStore } from '@/stores/useUserMfaStore'
import HelpTooltip from '@/components/HelpTooltip.vue'
import PaginatedTable from '@/components/PaginatedTable.vue'
import CommonButton from '@/components/CommonButton.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { dangerColoredButton } from '@/styles/ButtonStyle'

const props = defineProps<{
  userId: string
}>()

const { t } = useI18n()
const store = useUserMfaStore()

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString()
}

const revokeDialogOpen = ref(false)
const revokeTargetMfaId = ref<string | null>(null)

function openRevokeDialog(mfaId: string) {
  revokeTargetMfaId.value = mfaId
  revokeDialogOpen.value = true
}

async function confirmRevoke() {
  if (revokeTargetMfaId.value) {
    await store.revokeMfaMethod(props.userId, revokeTargetMfaId.value)
  }
  revokeDialogOpen.value = false
  revokeTargetMfaId.value = null
}

function cancelRevoke() {
  revokeDialogOpen.value = false
  revokeTargetMfaId.value = null
}
</script>

<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-900 mb-4">
      {{ t('pages.userDetail.mfaMethods') }}
      <HelpTooltip>
        <i18n-t keypath="pages.userDetail.mfaMethodsHelp" tag="p">
          <template #link>
            <a
              :href="t('pages.userDetail.mfaMethodsHelpLinkUrl')"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-600 hover:underline"
            >
              {{ t('pages.userDetail.mfaMethodsHelpLinkText') }}
            </a>
          </template>
        </i18n-t>
      </HelpTooltip>
    </h2>
    <PaginatedTable
      :loading="store.mfaLoading"
      :error="store.mfaError"
      :empty="store.mfaMethods.length === 0"
      :page="store.mfaPage"
      :total-pages="store.mfaTotalPages"
      @page-change="(page: number) => store.fetchMfaMethods(userId, page)"
    >
      <template #header>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.userDetail.mfaType') }}
        </th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.userDetail.registeredAt') }}
        </th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.userDetail.actions') }}
        </th>
      </template>

      <template #rows>
        <tr v-for="method in store.mfaMethods" :key="method.mfa_id">
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {{ method.type }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {{ formatDate(method.registered_at) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <CommonButton
              :button-style="dangerColoredButton"
              @click="openRevokeDialog(method.mfa_id)"
            >
              {{ t('pages.userDetail.revoke') }}
            </CommonButton>
          </td>
        </tr>
      </template>

      <template #empty>
        <p class="text-gray-600">{{ t('pages.userDetail.noMfaMethods') }}</p>
      </template>
    </PaginatedTable>

    <ConfirmDialog
      :open="revokeDialogOpen"
      :confirm-label="t('pages.userDetail.revoke')"
      @confirm="confirmRevoke"
      @cancel="cancelRevoke"
    >
      <template #title>
        {{ t('pages.userDetail.revokeMfaTitle') }}
      </template>
      <p class="text-sm text-gray-600">
        {{ t('pages.userDetail.revokeMfaDescription') }}
      </p>
    </ConfirmDialog>
  </div>
</template>
