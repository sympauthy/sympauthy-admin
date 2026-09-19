<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ConsentApi } from '../api/ConsentApi'
import type { ConsentListResource } from '../model/ConsentListResource'
import type { ConsentResource } from '../model/ConsentResource'
import { getErrorMessage, isSuccess, type ErrorApiResponse } from '@/shared/api'
import { formatDateTime } from '@/shared/lib'
import { CollectionPage, CollectionSortHeader, useCollection } from '@/features/browse-collection'
import { CommonButton, TableCell, TableHeader, Tag, dangerColoredButton } from '@/shared/ui'

const route = useRoute()
const { t } = useI18n()
const api = new ConsentApi()

const userId = computed(() => route.params.userId as string)

const consents = useCollection<ConsentResource, ConsentListResource>({
  capabilities: () => api.getConsentCapabilities(userId.value),
  page: (params) => api.listConsents(userId.value, params),
  items: (content) => content.consents
})

// The list is read again at the page it is displaying rather than from the first, so revoking the
// last consent of a page does not send the operator back to the top of the list.
async function revokeConsent(audienceId: string): Promise<void> {
  const response = await api.revokeConsent(userId.value, audienceId)

  if (isSuccess(response)) {
    await consents.fetch(consents.page)
  } else {
    consents.error = getErrorMessage(response as ErrorApiResponse)
  }
}

// The shell above this route nulls the record before re-reading it, which unmounts this tab and
// mounts it again — so this collection is the mount's own, and follows the record without a watcher
// and with nothing to disown.
onMounted(async () => {
  await consents.fetch()
})
</script>

<template>
  <CollectionPage :collection="consents" :search-placeholder="t('pages.userConsents.search')">
    <template #header>
      <CollectionSortHeader
        fit
        :collection="consents"
        :label="t('pages.userConsents.audience')"
        field="audience_id"
      />
      <CollectionSortHeader
        fit
        hidden-below="sm"
        :collection="consents"
        :label="t('pages.userConsents.client')"
        field="prompted_by_client_id"
      />
      <CollectionSortHeader
        :collection="consents"
        :label="t('pages.userConsents.scopes')"
        field="scope"
      />
      <CollectionSortHeader
        fit
        hidden-below="sm"
        :collection="consents"
        :label="t('pages.userConsents.consentedAt')"
        field="consented_at"
      />
      <TableHeader fit>{{ t('pages.userConsents.actions') }}</TableHeader>
    </template>

    <template #rows>
      <tr v-for="consent in consents.items" :key="consent.audience_id">
        <TableCell primary fit>
          {{ consent.audience_id }}
        </TableCell>
        <TableCell :label="t('pages.userConsents.client')" fit hidden-below="sm">
          {{ consent.prompted_by_client_id }}
        </TableCell>
        <TableCell :label="t('pages.userConsents.scopes')">
          <div class="flex flex-wrap gap-1">
            <Tag v-for="scope in consent.scopes ?? []" :key="scope" color="blue">
              {{ scope }}
            </Tag>
          </div>
        </TableCell>
        <TableCell :label="t('pages.userConsents.consentedAt')" fit hidden-below="sm">
          {{ formatDateTime(consent.consented_at) }}
        </TableCell>
        <TableCell fit>
          <CommonButton
            :button-style="dangerColoredButton"
            :label="t('pages.userConsents.revoke')"
            @click="revokeConsent(consent.audience_id)"
          />
        </TableCell>
      </tr>
    </template>

    <template #empty>
      <p class="text-sm text-gray-600">{{ t('pages.userConsents.empty') }}</p>
    </template>
  </CollectionPage>
</template>
