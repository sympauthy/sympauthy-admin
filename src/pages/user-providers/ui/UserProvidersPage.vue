<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserProviderLinkStore } from '@/entities/user'
import {
  CollectionPage,
  CollectionSortHeader,
  CommonButton,
  ConfirmDialog,
  TableCell,
  TableHeader,
  dangerColoredButton
} from '@/shared/ui'
import { formatDate } from '@/shared/lib'

const route = useRoute()
const { t } = useI18n()
const store = useUserProviderLinkStore()

const userId = computed(() => route.params.userId as string)

const unlinkTargetProviderId = ref<string | null>(null)

async function confirmUnlink() {
  if (unlinkTargetProviderId.value) {
    await store.unlinkProvider(unlinkTargetProviderId.value)
  }
  unlinkTargetProviderId.value = null
}

// The shell above this route nulls the record before re-reading it, which unmounts this tab and
// mounts it again — so the account is read once, here, and no watcher is needed to follow it.
onMounted(async () => {
  store.$reset()
  await store.fetchProviderLinks(userId.value)
})
</script>

<template>
  <CollectionPage
    :collection="store.providerLinks"
    :search-placeholder="t('pages.userProviders.search')"
  >
    <template #header>
      <CollectionSortHeader
        fit
        :collection="store.providerLinks"
        :label="t('pages.userProviders.provider')"
        field="provider_id"
      />
      <TableHeader>{{ t('pages.userProviders.subject') }}</TableHeader>
      <CollectionSortHeader
        fit
        hidden-below="sm"
        :collection="store.providerLinks"
        :label="t('pages.userProviders.linkedAt')"
        field="link_date"
      />
      <TableHeader fit>{{ t('pages.userProviders.actions') }}</TableHeader>
    </template>

    <template #rows>
      <tr v-for="link in store.providerLinks.items" :key="link.provider_id">
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
