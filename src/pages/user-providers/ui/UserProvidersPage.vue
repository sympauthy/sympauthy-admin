<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  UserProviderLinkApi,
  type UserProviderLinkListResource,
  type UserProviderLinkResource
} from '@/entities/user'
import { getErrorMessage, isSuccess, type ErrorApiResponse } from '@/shared/api'
import { CollectionPage, CollectionSortHeader, useCollection } from '@/features/browse-collection'
import {
  CommonButton,
  ConfirmDialog,
  TableCell,
  TableHeader,
  dangerColoredButton
} from '@/shared/ui'
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

const unlinkTargetProviderId = ref<string | null>(null)

// The list is read again at the page it is displaying rather than from the first, so unlinking the
// last provider of a page does not send the operator back to the top of the list.
async function confirmUnlink() {
  if (unlinkTargetProviderId.value) {
    const response = await api.unlinkProvider(userId.value, unlinkTargetProviderId.value)

    if (isSuccess(response)) {
      await providerLinks.fetch(providerLinks.page)
    } else {
      providerLinks.error = getErrorMessage(response as ErrorApiResponse)
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
      <CollectionSortHeader
        fit
        :collection="providerLinks"
        :label="t('pages.userProviders.provider')"
        field="provider_id"
      />
      <TableHeader>{{ t('pages.userProviders.subject') }}</TableHeader>
      <CollectionSortHeader
        fit
        hidden-below="sm"
        :collection="providerLinks"
        :label="t('pages.userProviders.linkedAt')"
        field="link_date"
      />
      <TableHeader fit>{{ t('pages.userProviders.actions') }}</TableHeader>
    </template>

    <template #rows>
      <tr v-for="link in providerLinks.items" :key="link.provider_id">
        <TableCell primary fit>
          {{ link.provider_id }}
        </TableCell>
        <TableCell :label="t('pages.userProviders.subject')" truncate>
          {{ link.subject }}
        </TableCell>
        <TableCell :label="t('pages.userProviders.linkedAt')" fit hidden-below="sm">
          {{ formatDate(link.linked_at) }}
        </TableCell>
        <TableCell fit>
          <CommonButton
            :button-style="dangerColoredButton"
            :label="t('pages.userProviders.unlink')"
            @click="unlinkTargetProviderId = link.provider_id"
          />
        </TableCell>
      </tr>
    </template>

    <template #empty>
      <p class="text-sm text-gray-600">{{ t('pages.userProviders.empty') }}</p>
    </template>
  </CollectionPage>

  <ConfirmDialog
    :open="unlinkTargetProviderId !== null"
    :confirm-label="t('pages.userProviders.unlink')"
    @confirm="confirmUnlink"
    @cancel="unlinkTargetProviderId = null"
  >
    <template #title>
      {{ t('pages.userProviders.unlinkTitle') }}
    </template>
    <p class="text-sm text-gray-600">
      {{ t('pages.userProviders.unlinkDescription') }}
    </p>
  </ConfirmDialog>
</template>
