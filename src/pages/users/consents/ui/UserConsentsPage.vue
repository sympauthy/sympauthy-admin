<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ConsentApi } from '../api/ConsentApi'
import type { ConsentListResource } from '../model/ConsentListResource'
import type { ConsentResource } from '../model/ConsentResource'
import { getErrorMessage, isSuccess } from '@/shared/api'
import { formatDateTime } from '@/shared/lib'
import { CollectionPage, useCollection } from '@/features/browse-collection'
import {
  SaConfirmDialog,
  SaTableActions,
  SaTableCell,
  SaTableHeader,
  SaTag
} from '@sympauthy/design'
import { type ActionItem, ActionsDropdown, DocHelpTooltip, TableRecord } from '@/shared/ui'

const route = useRoute()
const { t } = useI18n()
const api = new ConsentApi()

const userId = computed(() => route.params.userId as string)

const consents = useCollection<ConsentResource, ConsentListResource>({
  capabilities: () => api.getConsentCapabilities(userId.value),
  page: (params) => api.listConsents(userId.value, params),
  items: (content) => content.consents,
  key: (consent) => consent.audience_id
})

const actions = computed<ActionItem[]>(() => [
  {
    key: 'revoke',
    label: t('pages.userConsents.revoke'),
    danger: true,
    requiredScopes: ['admin:consent:write']
  }
])

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
  await consents.load()
})
</script>

<template>
  <CollectionPage :collection="consents" :search-placeholder="t('pages.userConsents.search')">
    <template #header>
      <SaTableHeader
        :sorting="consents.sort"
        field="prompted_by_client_id"
        :filtered-label="consents.filteredLabel('prompted_by_client_id')"
      >
        {{ t('pages.userConsents.client.label') }}
        <template #help>
          <DocHelpTooltip term="pages.userConsents.client" />
        </template>
      </SaTableHeader>
      <SaTableHeader
        :sorting="consents.sort"
        field="audience_id"
        :filtered-label="consents.filteredLabel('audience_id')"
      >
        {{ t('pages.userConsents.audience') }}
      </SaTableHeader>
      <SaTableHeader
        :sorting="consents.sort"
        field="scope"
        :filtered-label="consents.filteredLabel('scope')"
      >
        {{ t('pages.userConsents.scopes.label') }}
        <template #help>
          <DocHelpTooltip term="pages.userConsents.scopes" />
        </template>
      </SaTableHeader>
      <SaTableHeader
        fit
        :sorting="consents.sort"
        field="consented_at"
        :filtered-label="consents.filteredLabel('consented_at')"
      >
        {{ t('pages.userConsents.consentedAt') }}
      </SaTableHeader>
      <SaTableHeader fit>
        <span class="sr-only">{{ t('pages.userConsents.actions') }}</span>
      </SaTableHeader>
    </template>

    <template #rows>
      <tr v-for="consent in consents.items" :key="consent.audience_id">
        <!-- Named by the client that prompted the person, which is who an operator recognises. -->
        <SaTableCell primary truncate mono>
          <TableRecord
            :name="consent.prompted_by_client_id"
            :to="{ name: 'clientDetail', params: { clientId: consent.prompted_by_client_id } }"
          />
        </SaTableCell>
        <!-- A phone reads each value on a line of its own, as the canvas lists them, rather than
             wherever two fit. The package ends that phone's first line with a break that the row's gap
             falls on both sides of, so the name stands twice that gap above the audience; each line
             after it matches, so the four read evenly spaced. -->
        <SaTableCell
          :label="t('pages.userConsents.audience')"
          truncate
          mono
          class="max-sm:basis-full"
        >
          {{ consent.audience_id }}
        </SaTableCell>
        <SaTableCell
          :label="t('pages.userConsents.scopes.label')"
          class="max-sm:mt-1 max-sm:basis-full"
        >
          <div class="flex flex-wrap gap-1">
            <SaTag v-for="scope in consent.scopes ?? []" :key="scope" color="blue">
              {{ scope }}
            </SaTag>
          </div>
        </SaTableCell>
        <SaTableCell :label="t('pages.userConsents.consentedAt')" fit class="max-sm:mt-1">
          {{ formatDateTime(consent.consented_at) }}
        </SaTableCell>
        <SaTableActions>
          <ActionsDropdown
            :record="consent.audience_id"
            :actions="actions"
            @action="revokeTargetAudienceId = consent.audience_id"
          />
        </SaTableActions>
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
