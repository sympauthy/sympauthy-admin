<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserProviderLinkStore } from '@/entities/user'
import {
  CollectionPage,
  CollectionSortHeader,
  CommonButton,
  ConfirmDialog,
  HelpTooltip,
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

watch(userId, (id) => store.fetchProviderLinks(id))

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
    <template #actions>
      <HelpTooltip>
        <i18n-t keypath="pages.userProviders.help" tag="p">
          <template #link>
            <a
              :href="t('pages.userProviders.helpLinkUrl')"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-600 hover:underline"
            >
              {{ t('pages.userProviders.helpLinkText') }}
            </a>
          </template>
        </i18n-t>
      </HelpTooltip>
    </template>

    <template #header>
      <CollectionSortHeader
        class="w-0 whitespace-nowrap"
        :collection="store.providerLinks"
        :label="t('pages.userProviders.provider')"
        field="provider_id"
      />
      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        {{ t('pages.userProviders.subject') }}
      </th>
      <CollectionSortHeader
        class="w-0 whitespace-nowrap hidden sm:table-cell"
        :collection="store.providerLinks"
        :label="t('pages.userProviders.linkedAt')"
        field="link_date"
      />
      <th
        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-0 whitespace-nowrap"
      >
        {{ t('pages.userProviders.actions') }}
      </th>
    </template>

    <template #rows>
      <tr v-for="link in store.providerLinks.items" :key="link.provider_id">
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
            @click="unlinkTargetProviderId = link.provider_id"
          >
            {{ t('pages.userProviders.unlink') }}
          </CommonButton>
        </td>
      </tr>
    </template>

    <template #empty>
      <p class="text-gray-600">{{ t('pages.userProviders.empty') }}</p>
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
