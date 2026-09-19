<script lang="ts" setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserConsentStore } from '@/entities/consent'
import { formatDateTime } from '@/shared/lib'
import {
  CollectionPage,
  CollectionSortHeader,
  CommonButton,
  Tag,
  dangerColoredButton
} from '@/shared/ui'

const route = useRoute()
const { t } = useI18n()
const store = useUserConsentStore()

const userId = computed(() => route.params.userId as string)

watch(userId, (id) => store.fetchConsents(id))

onMounted(async () => {
  store.$reset()
  await store.fetchConsents(userId.value)
})
</script>

<template>
  <CollectionPage :collection="store.consents" :search-placeholder="t('pages.userConsents.search')">
    <template #header>
      <CollectionSortHeader
        class="w-0 whitespace-nowrap"
        :collection="store.consents"
        :label="t('pages.userConsents.audience')"
        field="audience_id"
      />
      <CollectionSortHeader
        class="w-0 whitespace-nowrap hidden sm:table-cell"
        :collection="store.consents"
        :label="t('pages.userConsents.client')"
        field="prompted_by_client_id"
      />
      <CollectionSortHeader
        :collection="store.consents"
        :label="t('pages.userConsents.scopes')"
        field="scope"
      />
      <CollectionSortHeader
        class="w-0 whitespace-nowrap hidden sm:table-cell"
        :collection="store.consents"
        :label="t('pages.userConsents.consentedAt')"
        field="consented_at"
      />
      <th
        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-0 whitespace-nowrap"
      >
        {{ t('pages.userConsents.actions') }}
      </th>
    </template>

    <template #rows>
      <tr v-for="consent in store.consents.items" :key="consent.audience_id">
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {{ consent.audience_id }}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
          {{ consent.prompted_by_client_id }}
        </td>
        <td class="px-6 py-4 text-sm">
          <div class="flex flex-wrap gap-1">
            <Tag v-for="scope in consent.scopes ?? []" :key="scope" color="blue">
              {{ scope }}
            </Tag>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
          {{ formatDateTime(consent.consented_at) }}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <CommonButton
            :button-style="dangerColoredButton"
            @click="store.revokeConsent(consent.audience_id)"
          >
            {{ t('pages.userConsents.revoke') }}
          </CommonButton>
        </td>
      </tr>
    </template>

    <template #empty>
      <p class="text-gray-600">{{ t('pages.userConsents.empty') }}</p>
    </template>
  </CollectionPage>
</template>
