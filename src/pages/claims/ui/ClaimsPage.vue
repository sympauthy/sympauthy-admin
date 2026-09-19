<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClaimStore, ClaimTags } from '@/entities/claim'
import { CollectionPage, CollectionSortHeader, Tag, OriginTag } from '@/shared/ui'

const { t } = useI18n()
const claimStore = useClaimStore()

onMounted(async () => {
  await claimStore.claims.fetch()
})
</script>

<template>
  <CollectionPage :collection="claimStore.claims" :search-placeholder="t('pages.claims.search')">
    <template #header>
      <CollectionSortHeader
        class="w-0 whitespace-nowrap"
        :collection="claimStore.claims"
        :label="t('pages.claims.status')"
        field="enabled"
      />
      <CollectionSortHeader
        :collection="claimStore.claims"
        :label="t('pages.claims.id')"
        field="id"
      />
      <CollectionSortHeader
        class="w-0 whitespace-nowrap"
        :collection="claimStore.claims"
        :label="t('common.origin.label')"
        field="origin"
      />
      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        {{ t('pages.claims.tags') }}
      </th>
    </template>

    <template #rows>
      <tr v-for="claim in claimStore.claims.items" :key="claim.id">
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <Tag v-if="claim.enabled" color="green">
            {{ t('pages.claims.enabled') }}
          </Tag>
          <Tag v-else color="red">
            {{ t('pages.claims.disabled') }}
          </Tag>
        </td>
        <td class="px-6 py-4 text-sm font-medium text-gray-900 truncate">
          {{ claim.id }}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <OriginTag :origin="claim.origin" />
        </td>
        <td class="px-6 py-4 text-sm text-gray-500">
          <ClaimTags :required="claim.required" :identifier="claim.identifier" />
        </td>
      </tr>
    </template>

    <template #empty>
      <p class="text-gray-600">{{ t('pages.claims.empty') }}</p>
    </template>
  </CollectionPage>
</template>
