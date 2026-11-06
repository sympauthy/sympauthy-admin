<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  UserMfaApi,
  type UserMfaMethodListResource,
  type UserMfaMethodResource,
  userMfaMethodTypeLabel
} from '@/entities/user'
import { getErrorMessage, isSuccess } from '@/shared/api'
import { CollectionPage, useCollection } from '@/features/browse-collection'
import { SaConfirmDialog, SaTableActions, SaTableCell, SaTableHeader } from '@sympauthy/design'
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
    key: 'remove',
    label: t('pages.userMfa.remove'),
    danger: true,
    requiredScopes: ['admin:users:write']
  }
])

const removeTargetMfaId = ref<string | null>(null)

// The list is read again at the page it is displaying rather than from the first, so removing the
// last enrolment of a page does not send the operator back to the top of the list.
async function confirmRemove() {
  if (removeTargetMfaId.value) {
    const response = await api.revokeMfaMethod(userId.value, removeTargetMfaId.value)

    if (isSuccess(response)) {
      await mfaMethods.fetch(mfaMethods.page)
    } else {
      mfaMethods.error = getErrorMessage(response)
    }
  }
  removeTargetMfaId.value = null
}

// The shell above this route nulls the record before re-reading it, which unmounts this tab and
// mounts it again — so this collection is the mount's own, and follows the record without a watcher
// and with nothing to disown.
onMounted(async () => {
  await mfaMethods.load()
})
</script>

<template>
  <CollectionPage :collection="mfaMethods">
    <template #header>
      <SaTableHeader>
        {{ t('pages.userMfa.type.label') }}
        <template #help>
          <DocHelpTooltip term="pages.userMfa.type" />
        </template>
      </SaTableHeader>
      <SaTableHeader
        fit
        :sorting="mfaMethods.sort"
        field="confirmed_date"
        :filtered-label="mfaMethods.filteredLabel('confirmed_date')"
      >
        {{ t('pages.userMfa.registeredAt') }}
      </SaTableHeader>
      <SaTableHeader fit>
        <span class="sr-only">{{ t('pages.userMfa.actions') }}</span>
      </SaTableHeader>
    </template>

    <template #rows>
      <tr v-for="method in mfaMethods.items" :key="method.mfa_id">
        <!-- Named by what an operator calls the method, with the type the server sent under it, or
             beside it on a phone, where the row has the width to spare and not the height. -->
        <SaTableCell primary>
          <div
            class="flex flex-col max-sm:flex-row max-sm:flex-wrap max-sm:items-baseline max-sm:gap-x-2"
          >
            <span>{{ userMfaMethodTypeLabel(method.type) }}</span>
            <span class="font-mono text-xs font-normal text-gray-500">{{ method.type }}</span>
          </div>
        </SaTableCell>
        <SaTableCell :label="t('pages.userMfa.registeredAt')" fit>
          {{ formatDate(method.registered_at) }}
        </SaTableCell>
        <SaTableActions>
          <ActionsDropdown
            :record="userMfaMethodTypeLabel(method.type)"
            :actions="actions"
            @action="removeTargetMfaId = method.mfa_id"
          />
        </SaTableActions>
      </tr>
    </template>

    <template #empty>
      <p class="text-sm text-gray-600">{{ t('pages.userMfa.empty') }}</p>
    </template>
  </CollectionPage>

  <SaConfirmDialog
    :open="removeTargetMfaId !== null"
    :confirm-label="t('pages.userMfa.removeConfirm')"
    :cancel-label="t('common.cancel')"
    @confirm="confirmRemove"
    @cancel="removeTargetMfaId = null"
  >
    <template #title>
      {{ t('pages.userMfa.removeTitle') }}
    </template>
    <p class="text-sm text-gray-600">
      {{ t('pages.userMfa.removeDescription') }}
    </p>
  </SaConfirmDialog>
</template>
