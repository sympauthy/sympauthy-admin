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
  TableCell,
  TableHeader,
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
      <TableHeader fit>{{ t('pages.userMfa.type') }}</TableHeader>
      <!-- The set has nothing else to say about a method, and a table of nothing but shrink-wrapped
           columns would bunch them against the left edge. This one takes what is left. -->
      <TableHeader />
      <CollectionSortHeader
        fit
        :collection="store.mfaMethods"
        :label="t('pages.userMfa.registeredAt')"
        field="confirmed_date"
      />
      <TableHeader fit>{{ t('pages.userMfa.actions') }}</TableHeader>
    </template>

    <template #rows>
      <tr v-for="method in store.mfaMethods.items" :key="method.mfa_id">
        <TableCell primary fit>
          {{ method.type }}
        </TableCell>
        <TableCell />
        <TableCell :label="t('pages.userMfa.registeredAt')" fit>
          {{ formatDate(method.registered_at) }}
        </TableCell>
        <TableCell fit>
          <CommonButton
            :button-style="dangerColoredButton"
            :label="t('pages.userMfa.revoke')"
            @click="revokeTargetMfaId = method.mfa_id"
          />
        </TableCell>
      </tr>
    </template>

    <template #empty>
      <p class="text-sm text-gray-600">{{ t('pages.userMfa.empty') }}</p>
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
