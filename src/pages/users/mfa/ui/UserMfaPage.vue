<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  UserMfaApi,
  type UserMfaMethodListResource,
  type UserMfaMethodResource
} from '@/entities/user'
import { getErrorMessage, isSuccess } from '@/shared/api'
import { CollectionPage, CollectionSortHeader, useCollection } from '@/features/browse-collection'
import { SaConfirmDialog, SaTableCell, SaTableHeader } from '@sympauthy/design'
import { type ActionItem, ActionsDropdown, DocHelpTooltip } from '@/shared/ui'
import { formatDate } from '@/shared/lib'

const route = useRoute()
const { t } = useI18n()
const api = new UserMfaApi()

const userId = computed(() => route.params.userId as string)

const mfaMethods = useCollection<UserMfaMethodResource, UserMfaMethodListResource>({
  capabilities: () => api.getMfaCapabilities(userId.value),
  page: (params) => api.listMfaMethods(userId.value, params),
  items: (content) => content.mfa_methods
})

const actions = computed<ActionItem[]>(() => [
  {
    key: 'revoke',
    label: t('pages.userMfa.revoke'),
    danger: true,
    requiredScopes: ['admin:users:write']
  }
])

const revokeTargetMfaId = ref<string | null>(null)

// The list is read again at the page it is displaying rather than from the first, so revoking the
// last enrolment of a page does not send the operator back to the top of the list.
async function confirmRevoke() {
  if (revokeTargetMfaId.value) {
    const response = await api.revokeMfaMethod(userId.value, revokeTargetMfaId.value)

    if (isSuccess(response)) {
      await mfaMethods.fetch(mfaMethods.page)
    } else {
      mfaMethods.error = getErrorMessage(response)
    }
  }
  revokeTargetMfaId.value = null
}

// The shell above this route nulls the record before re-reading it, which unmounts this tab and
// mounts it again — so this collection is the mount's own, and follows the record without a watcher
// and with nothing to disown.
onMounted(async () => {
  await mfaMethods.fetch()
})
</script>

<template>
  <CollectionPage :collection="mfaMethods">
    <template #header>
      <SaTableHeader>
        {{ t('pages.userMfa.type.label') }}
        <DocHelpTooltip term="pages.userMfa.type" />
      </SaTableHeader>
      <CollectionSortHeader
        fit
        :collection="mfaMethods"
        :label="t('pages.userMfa.registeredAt')"
        field="confirmed_date"
      />
      <SaTableHeader fit>
        <span class="sr-only">{{ t('pages.userMfa.actions') }}</span>
      </SaTableHeader>
    </template>

    <template #rows>
      <tr v-for="method in mfaMethods.items" :key="method.mfa_id">
        <SaTableCell primary>
          {{ method.type }}
        </SaTableCell>
        <SaTableCell :label="t('pages.userMfa.registeredAt')" fit>
          {{ formatDate(method.registered_at) }}
        </SaTableCell>
        <SaTableCell actions>
          <ActionsDropdown
            :record="method.type"
            :actions="actions"
            @action="revokeTargetMfaId = method.mfa_id"
          />
        </SaTableCell>
      </tr>
    </template>

    <template #empty>
      <p class="text-sm text-gray-600">{{ t('pages.userMfa.empty') }}</p>
    </template>
  </CollectionPage>

  <SaConfirmDialog
    :open="revokeTargetMfaId !== null"
    :confirm-label="t('pages.userMfa.revokeConfirm')"
    :cancel-label="t('common.cancel')"
    @confirm="confirmRevoke"
    @cancel="revokeTargetMfaId = null"
  >
    <template #title>
      {{ t('pages.userMfa.revokeTitle') }}
    </template>
    <p class="text-sm text-gray-600">
      {{ t('pages.userMfa.revokeDescription') }}
    </p>
  </SaConfirmDialog>
</template>
