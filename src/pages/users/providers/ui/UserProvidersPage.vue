<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  UserProviderLinkApi,
  type UserProviderLinkListResource,
  type UserProviderLinkResource
} from '@/entities/user'
import { getErrorMessage, isSuccess } from '@/shared/api'
import { CollectionPage, useCollection } from '@/features/browse-collection'
import { SaConfirmDialog, SaTableCell, SaTableHeader } from '@sympauthy/design'
import { type ActionItem, ActionsDropdown, DocHelpTooltip } from '@/shared/ui'
import { formatDate } from '@/shared/lib'

const route = useRoute()
const { t } = useI18n()
const api = new UserProviderLinkApi()

const userId = computed(() => route.params.userId as string)

const providerLinks = useCollection<UserProviderLinkResource, UserProviderLinkListResource>({
  capabilities: () => api.getProviderLinkCapabilities(userId.value),
  page: (params) => api.listProviderLinks(userId.value, params),
  items: (content) => content.providers
})

const actions = computed<ActionItem[]>(() => [
  {
    key: 'unlink',
    label: t('pages.userProviders.unlink'),
    danger: true,
    requiredScopes: ['admin:users:write']
  }
])

const unlinkTargetProviderId = ref<string | null>(null)

// The list is read again at the page it is displaying rather than from the first, so unlinking the
// last provider of a page does not send the operator back to the top of the list.
async function confirmUnlink() {
  if (unlinkTargetProviderId.value) {
    const response = await api.unlinkProvider(userId.value, unlinkTargetProviderId.value)

    if (isSuccess(response)) {
      await providerLinks.fetch(providerLinks.page)
    } else {
      providerLinks.error = getErrorMessage(response)
    }
  }
  unlinkTargetProviderId.value = null
}

// The shell above this route nulls the record before re-reading it, which unmounts this tab and
// mounts it again — so this collection is the mount's own, and follows the record without a watcher
// and with nothing to disown.
onMounted(async () => {
  await providerLinks.fetch()
})
</script>

<template>
  <CollectionPage :collection="providerLinks" :search-placeholder="t('pages.userProviders.search')">
    <template #header>
      <SaTableHeader
        :sorting="providerLinks.sort"
        field="provider_id"
        :filtered-label="providerLinks.filteredLabel('provider_id')"
      >
        {{ t('pages.userProviders.provider') }}
      </SaTableHeader>
      <SaTableHeader>
        {{ t('pages.userProviders.subject.label') }}
        <DocHelpTooltip term="pages.userProviders.subject" />
      </SaTableHeader>
      <SaTableHeader
        fit
        hidden-below="sm"
        :sorting="providerLinks.sort"
        field="link_date"
        :filtered-label="providerLinks.filteredLabel('link_date')"
      >
        {{ t('pages.userProviders.linkedAt') }}
      </SaTableHeader>
      <SaTableHeader fit>
        <span class="sr-only">{{ t('pages.userProviders.actions') }}</span>
      </SaTableHeader>
    </template>

    <template #rows>
      <tr v-for="link in providerLinks.items" :key="link.provider_id">
        <SaTableCell primary truncate mono>
          {{ link.provider_id }}
        </SaTableCell>
        <SaTableCell :label="t('pages.userProviders.subject.label')" truncate mono>
          {{ link.subject }}
        </SaTableCell>
        <SaTableCell :label="t('pages.userProviders.linkedAt')" fit hidden-below="sm">
          {{ formatDate(link.linked_at) }}
        </SaTableCell>
        <SaTableCell actions>
          <ActionsDropdown
            :record="link.provider_id"
            :actions="actions"
            @action="unlinkTargetProviderId = link.provider_id"
          />
        </SaTableCell>
      </tr>
    </template>

    <template #empty>
      <p class="text-sm text-gray-600">{{ t('pages.userProviders.empty') }}</p>
    </template>
  </CollectionPage>

  <SaConfirmDialog
    :open="unlinkTargetProviderId !== null"
    :confirm-label="t('pages.userProviders.unlinkConfirm')"
    :cancel-label="t('common.cancel')"
    @confirm="confirmUnlink"
    @cancel="unlinkTargetProviderId = null"
  >
    <template #title>
      {{ t('pages.userProviders.unlinkTitle') }}
    </template>
    <p class="text-sm text-gray-600">
      {{ t('pages.userProviders.unlinkDescription') }}
    </p>
  </SaConfirmDialog>
</template>
