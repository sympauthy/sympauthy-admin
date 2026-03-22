<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserProviderLinkStore } from '@/stores/useUserProviderLinkStore'
import HelpTooltip from '@/components/HelpTooltip.vue'
import PaginatedTable from '@/components/PaginatedTable.vue'
import CommonButton from '@/components/CommonButton.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { dangerColoredButton } from '@/styles/ButtonStyle'

const props = defineProps<{
  userId: string
}>()

const { t } = useI18n()
const store = useUserProviderLinkStore()

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString()
}

const unlinkDialogOpen = ref(false)
const unlinkTargetProviderId = ref<string | null>(null)

function openUnlinkDialog(providerId: string) {
  unlinkTargetProviderId.value = providerId
  unlinkDialogOpen.value = true
}

async function confirmUnlink() {
  if (unlinkTargetProviderId.value) {
    await store.unlinkProvider(props.userId, unlinkTargetProviderId.value)
  }
  unlinkDialogOpen.value = false
  unlinkTargetProviderId.value = null
}

function cancelUnlink() {
  unlinkDialogOpen.value = false
  unlinkTargetProviderId.value = null
}
</script>

<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-900 mb-4">
      {{ t('pages.userDetail.providerLinks') }}
      <HelpTooltip>
        <i18n-t keypath="pages.userDetail.providerLinksHelp" tag="p">
          <template #link>
            <a
              :href="t('pages.userDetail.providerLinksHelpLinkUrl')"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-600 hover:underline"
            >
              {{ t('pages.userDetail.providerLinksHelpLinkText') }}
            </a>
          </template>
        </i18n-t>
      </HelpTooltip>
    </h2>
    <PaginatedTable
      :loading="store.providerLinksLoading"
      :error="store.providerLinksError"
      :empty="store.providerLinks.length === 0"
      :page="store.providerLinksPage"
      :total-pages="store.providerLinksTotalPages"
      @page-change="(page: number) => store.fetchProviderLinks(userId, page)"
    >
      <template #header>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-0 whitespace-nowrap">
          {{ t('pages.userDetail.provider') }}
        </th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.userDetail.subject') }}
        </th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-0 whitespace-nowrap hidden sm:table-cell">
          {{ t('pages.userDetail.linkedAt') }}
        </th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-0 whitespace-nowrap">
          {{ t('pages.userDetail.actions') }}
        </th>
      </template>

      <template #rows>
        <tr v-for="link in store.providerLinks" :key="link.provider_id">
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {{ link.provider_id }}
          </td>
          <td class="px-6 py-4 text-sm text-gray-900 truncate">
            {{ link.subject }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
            {{ formatDate(link.linked_at) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <CommonButton
              :button-style="dangerColoredButton"
              @click="openUnlinkDialog(link.provider_id)"
            >
              {{ t('pages.userDetail.unlink') }}
            </CommonButton>
          </td>
        </tr>
      </template>

      <template #empty>
        <p class="text-gray-600">{{ t('pages.userDetail.noProviderLinks') }}</p>
      </template>
    </PaginatedTable>

    <ConfirmDialog
      :open="unlinkDialogOpen"
      :confirm-label="t('pages.userDetail.unlink')"
      @confirm="confirmUnlink"
      @cancel="cancelUnlink"
    >
      <template #title>
        {{ t('pages.userDetail.unlinkProviderTitle') }}
      </template>
      <p class="text-sm text-gray-600">
        {{ t('pages.userDetail.unlinkProviderDescription') }}
      </p>
    </ConfirmDialog>
  </div>
</template>
