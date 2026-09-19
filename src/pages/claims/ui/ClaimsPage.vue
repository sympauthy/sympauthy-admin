<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClaimStore, ClaimTags } from '@/entities/claim'
import {
  CollectionPage,
  CollectionSortHeader,
  OriginTag,
  TableCell,
  TableHeader,
  Tag
} from '@/shared/ui'

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
        fit
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
        fit
        :collection="claimStore.claims"
        :label="t('common.origin.label')"
        field="origin"
      />
      <TableHeader>{{ t('pages.claims.tags') }}</TableHeader>
    </template>

    <template #rows>
      <tr v-for="claim in claimStore.claims.items" :key="claim.id">
        <TableCell :label="t('pages.claims.status')" fit>
          <Tag v-if="claim.enabled" color="green">
            {{ t('pages.claims.enabled') }}
          </Tag>
          <Tag v-else color="red">
            {{ t('pages.claims.disabled') }}
          </Tag>
        </TableCell>
        <TableCell primary truncate>
          {{ claim.id }}
        </TableCell>
        <TableCell :label="t('common.origin.label')" fit>
          <OriginTag :origin="claim.origin" />
        </TableCell>
        <TableCell :label="t('pages.claims.tags')">
          <ClaimTags :required="claim.required" :identifier="claim.identifier" />
        </TableCell>
      </tr>
    </template>

    <template #empty>
      <p class="text-sm text-gray-600">{{ t('pages.claims.empty') }}</p>
    </template>
  </CollectionPage>
</template>
