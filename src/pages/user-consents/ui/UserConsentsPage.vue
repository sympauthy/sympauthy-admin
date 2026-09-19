<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserConsentStore } from '@/entities/consent'
import { formatDateTime } from '@/shared/lib'
import {
  CollectionPage,
  CollectionSortHeader,
  CommonButton,
  TableCell,
  TableHeader,
  Tag,
  dangerColoredButton
} from '@/shared/ui'

const route = useRoute()
const { t } = useI18n()
const store = useUserConsentStore()

const userId = computed(() => route.params.userId as string)

// The shell above this route nulls the record before re-reading it, which unmounts this tab and
// mounts it again — so the account is read once, here, and no watcher is needed to follow it.
onMounted(async () => {
  store.$reset()
  await store.fetchConsents(userId.value)
})
</script>

<template>
  <CollectionPage :collection="store.consents" :search-placeholder="t('pages.userConsents.search')">
    <template #header>
      <CollectionSortHeader
        fit
        :collection="store.consents"
        :label="t('pages.userConsents.audience')"
        field="audience_id"
      />
      <CollectionSortHeader
        fit
        hidden-below="sm"
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
        fit
        hidden-below="sm"
        :collection="store.consents"
        :label="t('pages.userConsents.consentedAt')"
        field="consented_at"
      />
      <TableHeader fit>{{ t('pages.userConsents.actions') }}</TableHeader>
    </template>

    <template #rows>
      <tr v-for="consent in store.consents.items" :key="consent.audience_id">
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
            @click="store.revokeConsent(consent.audience_id)"
          />
        </TableCell>
      </tr>
    </template>

    <template #empty>
      <p class="text-sm text-gray-600">{{ t('pages.userConsents.empty') }}</p>
    </template>
  </CollectionPage>
</template>
