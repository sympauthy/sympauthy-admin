<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserMfaStore } from '@/entities/user'
import {
  CollectionPage,
  CollectionSortHeader,
  CommonButton,
  ConfirmDialog,
  dangerColoredButton
} from '@/shared/ui'
import { formatDate } from '@/shared/lib'

const route = useRoute()
const { t } = useI18n()
const store = useUserMfaStore()

const userId = computed(() => route.params.userId as string)

const revokeTargetMfaId = ref<string | null>(null)

async function confirmRevoke() {
  if (revokeTargetMfaId.value) {
    await store.revokeMfaMethod(revokeTargetMfaId.value)
  }
  revokeTargetMfaId.value = null
}

// The shell above this route nulls the record before re-reading it, which unmounts this tab and
// mounts it again — so the account is read once, here, and no watcher is needed to follow it.
onMounted(async () => {
  store.$reset()
  await store.fetchMfaMethods(userId.value)
})
</script>

<template>
  <CollectionPage :collection="store.mfaMethods">
    <template #header>
      <th
        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-0 whitespace-nowrap"
      >
        {{ t('pages.userMfa.type') }}
      </th>
      <th class="px-6 py-3"></th>
      <CollectionSortHeader
        class="w-0 whitespace-nowrap"
        :collection="store.mfaMethods"
        :label="t('pages.userMfa.registeredAt')"
        field="confirmed_date"
      />
      <th
        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-0 whitespace-nowrap"
      >
        {{ t('pages.userMfa.actions') }}
      </th>
    </template>

    <template #rows>
      <tr v-for="method in store.mfaMethods.items" :key="method.mfa_id">
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {{ method.type }}
        </td>
        <td></td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {{ formatDate(method.registered_at) }}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <CommonButton
            :button-style="dangerColoredButton"
            @click="revokeTargetMfaId = method.mfa_id"
          >
            {{ t('pages.userMfa.revoke') }}
          </CommonButton>
        </td>
      </tr>
    </template>

    <template #empty>
      <p class="text-gray-600">{{ t('pages.userMfa.empty') }}</p>
    </template>
  </CollectionPage>

  <ConfirmDialog
    :open="revokeTargetMfaId !== null"
    :confirm-label="t('pages.userMfa.revoke')"
    @confirm="confirmRevoke"
    @cancel="revokeTargetMfaId = null"
  >
    <template #title>
      {{ t('pages.userMfa.revokeTitle') }}
    </template>
    <p class="text-sm text-gray-600">
      {{ t('pages.userMfa.revokeDescription') }}
    </p>
  </ConfirmDialog>
</template>
