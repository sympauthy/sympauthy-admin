<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ConsentApi } from '../api/ConsentApi'
import type { ConsentListResource } from '../model/ConsentListResource'
import type { ConsentResource } from '../model/ConsentResource'
import { getErrorMessage, isSuccess } from '@/shared/api'
import { formatDateTime } from '@/shared/lib'
import { CollectionPage, CollectionSortHeader, useCollection } from '@/features/browse-collection'
import { SaConfirmDialog, SaTableCell, SaTableHeader, SaTag } from '@sympauthy/design'
import { CommonButton, DocHelpTooltip } from '@/shared/ui'

const route = useRoute()
const { t } = useI18n()
const api = new ConsentApi()

const userId = computed(() => route.params.userId as string)

const consents = useCollection<ConsentResource, ConsentListResource>({
  capabilities: () => api.getConsentCapabilities(userId.value),
  page: (params) => api.listConsents(userId.value, params),
  items: (content) => content.consents
})

const revokeTargetAudienceId = ref<string | null>(null)
const revokeLoading = ref(false)
const revokeError = ref<string | null>(null)

function onCancelRevoke() {
  revokeTargetAudienceId.value = null
  revokeError.value = null
}

// The list is read again at the page it is displaying rather than from the first, so revoking the
// last consent of a page does not send the operator back to the top of the list.
async function confirmRevoke(): Promise<void> {
  if (!revokeTargetAudienceId.value) return

  revokeLoading.value = true
  revokeError.value = null
  const response = await api.revokeConsent(userId.value, revokeTargetAudienceId.value)
  revokeLoading.value = false

  if (isSuccess(response)) {
    revokeTargetAudienceId.value = null
    await consents.fetch(consents.page)
  } else {
    revokeError.value = getErrorMessage(response)
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
        :label="t('pages.userConsents.client.label')"
        field="prompted_by_client_id"
      >
        <template #help>
          <DocHelpTooltip term="pages.userConsents.client" />
        </template>
      </CollectionSortHeader>
      <CollectionSortHeader
        :collection="consents"
        :label="t('pages.userConsents.scopes.label')"
        field="scope"
      >
        <template #help>
          <DocHelpTooltip term="pages.userConsents.scopes" />
        </template>
      </CollectionSortHeader>
      <CollectionSortHeader
        fit
        hidden-below="sm"
        :collection="consents"
        :label="t('pages.userConsents.consentedAt')"
        field="consented_at"
      />
      <SaTableHeader fit>{{ t('pages.userConsents.actions') }}</SaTableHeader>
    </template>

    <template #rows>
      <tr v-for="consent in consents.items" :key="consent.audience_id">
        <SaTableCell primary fit>
          {{ consent.audience_id }}
        </SaTableCell>
        <SaTableCell :label="t('pages.userConsents.client.label')" fit hidden-below="sm">
          {{ consent.prompted_by_client_id }}
        </SaTableCell>
        <SaTableCell :label="t('pages.userConsents.scopes.label')">
          <div class="flex flex-wrap gap-1">
            <SaTag v-for="scope in consent.scopes ?? []" :key="scope" color="blue">
              {{ scope }}
            </SaTag>
          </div>
        </SaTableCell>
        <SaTableCell :label="t('pages.userConsents.consentedAt')" fit hidden-below="sm">
          {{ formatDateTime(consent.consented_at) }}
        </SaTableCell>
        <SaTableCell fit>
          <CommonButton
            variant="secondary"
            :label="t('pages.userConsents.revoke')"
            :required-scopes="['admin:consent:write']"
            @click="revokeTargetAudienceId = consent.audience_id"
          />
        </SaTableCell>
      </tr>
    </template>

    <template #empty>
      <p class="text-sm text-gray-600">{{ t('pages.userConsents.empty') }}</p>
    </template>
  </CollectionPage>

  <SaConfirmDialog
    :open="revokeTargetAudienceId !== null"
    :confirm-label="t('pages.userConsents.revokeConfirm')"
    :cancel-label="t('common.cancel')"
    :loading="revokeLoading"
    :error="revokeError"
    @confirm="confirmRevoke"
    @cancel="onCancelRevoke"
  >
    <template #title>
      {{ t('pages.userConsents.revokeTitle') }}
    </template>
    <p class="text-sm text-gray-600">
      {{ t('pages.userConsents.revokeDescription') }}
    </p>
  </SaConfirmDialog>
</template>
