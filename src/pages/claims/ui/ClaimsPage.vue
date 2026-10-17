<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ClaimApi,
  ClaimKindTag,
  ClaimPublishedInTag,
  ClaimTags,
  type ClaimListResource,
  type ClaimResource
} from '@/entities/claim'
import { CollectionPage, CollectionSortHeader, useCollection } from '@/features/browse-collection'
import { CommonTag, DocHelpTooltip, OriginTag, TableCell, TableHeader } from '@/shared/ui'

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
        :label="t('terms.origin.label')"
        field="origin"
      >
        <template #help>
          <DocHelpTooltip term="pages.claims.origin" />
        </template>
      </CollectionSortHeader>
      <CollectionSortHeader
        fit
        :collection="claims"
        :label="t('pages.claims.kind.label')"
        field="kind"
      >
        <template #help>
          <DocHelpTooltip term="pages.claims.kind" />
        </template>
      </CollectionSortHeader>
      <TableHeader fit>{{ t('pages.claims.tags') }}</TableHeader>
      <TableHeader fit>
        {{ t('pages.claims.publishedIn.label') }}
        <DocHelpTooltip term="pages.claims.publishedIn" />
      </TableHeader>
    </template>

    <template #rows>
      <tr v-for="claim in claims.items" :key="claim.id">
        <TableCell :label="t('pages.claims.status')" fit>
          <CommonTag v-if="claim.enabled" color="green">
            {{ t('pages.claims.enabled') }}
          </CommonTag>
          <CommonTag v-else color="red">
            {{ t('pages.claims.disabled') }}
          </CommonTag>
        </TableCell>
        <TableCell primary truncate>
          {{ claim.id }}
        </TableCell>
        <TableCell :label="t('terms.origin.label')" fit>
          <OriginTag :origin="claim.origin" />
        </TableCell>
        <TableCell :label="t('pages.claims.kind.label')" fit>
          <ClaimKindTag :kind="claim.kind" />
        </TableCell>
        <TableCell :label="t('pages.claims.tags')" fit>
          <ClaimTags :required="claim.required" :identifier="claim.identifier" />
        </TableCell>
        <TableCell :label="t('pages.claims.publishedIn.label')" fit>
          <ClaimPublishedInTag :places="claim.published_in" />
        </TableCell>
      </tr>
    </template>

    <template #empty>
      <p class="text-sm text-gray-600">{{ t('pages.claims.empty') }}</p>
    </template>
  </CollectionPage>
</template>
