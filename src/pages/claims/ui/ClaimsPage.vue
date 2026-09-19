<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ClaimApi, ClaimTags, type ClaimListResource, type ClaimResource } from '@/entities/claim'
import { CollectionPage, CollectionSortHeader, useCollection } from '@/features/browse-collection'
import { OriginTag, TableCell, TableHeader, Tag } from '@/shared/ui'

const { t } = useI18n()
const api = new ClaimApi()

const claims = useCollection<ClaimResource, ClaimListResource>({
  capabilities: () => api.getClaimCapabilities(),
  page: (params) => api.listClaims(params),
  items: (content) => content.claims
})

onMounted(async () => {
  await claims.fetch()
})
</script>

<template>
  <CollectionPage :collection="claims" :search-placeholder="t('pages.claims.search')">
    <template #header>
      <CollectionSortHeader
        fit
        :collection="claims"
        :label="t('pages.claims.status')"
        field="enabled"
      />
      <CollectionSortHeader :collection="claims" :label="t('pages.claims.id')" field="id" />
      <CollectionSortHeader
        fit
        :collection="claims"
        :label="t('common.origin.label')"
        field="origin"
      />
      <TableHeader>{{ t('pages.claims.tags') }}</TableHeader>
    </template>

    <template #rows>
      <tr v-for="claim in claims.items" :key="claim.id">
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
