<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserClaimStore } from '@/entities/user'
import { ClaimTags } from '@/entities/claim'
import {
  CollectionPage,
  CollectionSortHeader,
  EmptyValue,
  OriginTag,
  TableCell,
  TableHeader
} from '@/shared/ui'
import { formatDate } from '@/shared/lib'

const route = useRoute()
const { t } = useI18n()
const store = useUserClaimStore()

const userId = computed(() => route.params.userId as string)

// The shell above this route nulls the record before re-reading it, which unmounts this tab and
// mounts it again — so the account is read once, here, and no watcher is needed to follow it.
onMounted(async () => {
  store.$reset()
  await store.fetchClaims(userId.value)
})
</script>

<template>
  <CollectionPage :collection="store.claims" :search-placeholder="t('pages.userClaims.search')">
    <template #header>
      <CollectionSortHeader
        fit
        :collection="store.claims"
        :label="t('pages.userClaims.claim')"
        field="claim_id"
      />
      <CollectionSortHeader
        :collection="store.claims"
        :label="t('pages.userClaims.value')"
        field="value"
      />
      <CollectionSortHeader
        fit
        :collection="store.claims"
        :label="t('common.origin.label')"
        field="origin"
      />
      <TableHeader fit>{{ t('pages.userClaims.tags') }}</TableHeader>
      <CollectionSortHeader
        fit
        :collection="store.claims"
        :label="t('pages.userClaims.collectedAt')"
        field="collected"
      />
      <CollectionSortHeader
        fit
        :collection="store.claims"
        :label="t('pages.userClaims.verifiedAt')"
        field="verified"
      />
    </template>

    <template #rows>
      <tr v-for="claim in store.claims.items" :key="claim.claim_id">
        <TableCell primary fit>
          {{ claim.claim_id }}
        </TableCell>
        <TableCell :label="t('pages.userClaims.value')" truncate>
          {{ claim.value }}
        </TableCell>
        <TableCell :label="t('common.origin.label')" fit>
          <OriginTag :origin="claim.origin" />
        </TableCell>
        <TableCell :label="t('pages.userClaims.tags')" fit>
          <ClaimTags :required="claim.required" :identifier="claim.identifier" />
        </TableCell>
        <TableCell :label="t('pages.userClaims.collectedAt')" fit>
          <span v-if="claim.collected_at">{{ formatDate(claim.collected_at) }}</span>
          <EmptyValue v-else />
        </TableCell>
        <TableCell :label="t('pages.userClaims.verifiedAt')" fit>
          <span v-if="claim.verified_at">{{ formatDate(claim.verified_at) }}</span>
          <EmptyValue v-else />
        </TableCell>
      </tr>
    </template>

    <template #empty>
      <p class="text-sm text-gray-600">{{ t('pages.userClaims.empty') }}</p>
    </template>
  </CollectionPage>
</template>
