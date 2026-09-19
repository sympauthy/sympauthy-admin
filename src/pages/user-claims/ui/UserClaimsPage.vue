<script lang="ts" setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserClaimStore } from '@/entities/user'
import { ClaimTags } from '@/entities/claim'
import { CollectionPage, CollectionSortHeader, OriginTag } from '@/shared/ui'
import { formatDate } from '@/shared/lib'

const route = useRoute()
const { t } = useI18n()
const store = useUserClaimStore()

const userId = computed(() => route.params.userId as string)

function formatOptionalDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return formatDate(dateStr)
}

// The tab is kept mounted while the operator moves between records from a link, so the account it
// reads is watched rather than only read once.
watch(userId, (id) => store.fetchClaims(id))

onMounted(async () => {
  store.$reset()
  await store.fetchClaims(userId.value)
})
</script>

<template>
  <CollectionPage :collection="store.claims" :search-placeholder="t('pages.userClaims.search')">
    <template #header>
      <CollectionSortHeader
        class="w-0 whitespace-nowrap"
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
        class="w-0 whitespace-nowrap"
        :collection="store.claims"
        :label="t('common.origin.label')"
        field="origin"
      />
      <th
        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-0 whitespace-nowrap"
      >
        {{ t('pages.userClaims.tags') }}
      </th>
      <CollectionSortHeader
        class="w-0 whitespace-nowrap"
        :collection="store.claims"
        :label="t('pages.userClaims.collectedAt')"
        field="collected"
      />
      <CollectionSortHeader
        class="w-0 whitespace-nowrap"
        :collection="store.claims"
        :label="t('pages.userClaims.verifiedAt')"
        field="verified"
      />
    </template>

    <template #rows>
      <tr v-for="claim in store.claims.items" :key="claim.claim_id">
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {{ claim.claim_id }}
        </td>
        <td class="px-6 py-4 text-sm text-gray-900 truncate">
          {{ claim.value }}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <OriginTag :origin="claim.origin" />
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <ClaimTags :required="claim.required" :identifier="claim.identifier" />
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {{ formatOptionalDate(claim.collected_at) }}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {{ formatOptionalDate(claim.verified_at) }}
        </td>
      </tr>
    </template>

    <template #empty>
      <p class="text-gray-600">{{ t('pages.userClaims.empty') }}</p>
    </template>
  </CollectionPage>
</template>
