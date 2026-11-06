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
import { CollectionPage, useCollection } from '@/features/browse-collection'
import { SaTableCell, SaTableHeader, SaTag } from '@sympauthy/design'
import { DocHelpTooltip, OriginTag } from '@/shared/ui'

const { t } = useI18n()
const api = new ClaimApi()

const claims = useCollection<ClaimResource, ClaimListResource>({
  capabilities: () => api.getClaimCapabilities(),
  page: (params) => api.listClaims(params),
  items: (content) => content.claims,
  key: (claim) => claim.id
})

onMounted(async () => {
  await claims.load()
})
</script>

<template>
  <CollectionPage :collection="claims" :search-placeholder="t('pages.claims.search')">
    <template #header>
      <SaTableHeader :sorting="claims.sort" field="id" :filtered-label="claims.filteredLabel('id')">
        {{ t('pages.claims.id') }}
      </SaTableHeader>
      <SaTableHeader
        fit
        :sorting="claims.sort"
        field="enabled"
        :filtered-label="claims.filteredLabel('enabled')"
      >
        {{ t('pages.claims.status.label') }}
        <template #help>
          <DocHelpTooltip term="pages.claims.status" />
        </template>
      </SaTableHeader>
      <SaTableHeader
        fit
        :sorting="claims.sort"
        field="origin"
        :filtered-label="claims.filteredLabel('origin')"
      >
        {{ t('terms.origin.label') }}
        <template #help>
          <DocHelpTooltip term="pages.claims.origin" />
        </template>
      </SaTableHeader>
      <SaTableHeader
        fit
        :sorting="claims.sort"
        field="kind"
        :filtered-label="claims.filteredLabel('kind')"
      >
        {{ t('pages.claims.kind.label') }}
        <template #help>
          <DocHelpTooltip term="pages.claims.kind" />
        </template>
      </SaTableHeader>
      <SaTableHeader fit>{{ t('pages.claims.tags') }}</SaTableHeader>
      <SaTableHeader fit>
        {{ t('pages.claims.publishedIn.label') }}
        <DocHelpTooltip term="pages.claims.publishedIn" />
      </SaTableHeader>
    </template>

    <template #rows>
      <tr v-for="claim in claims.items" :key="claim.id">
        <SaTableCell primary truncate>
          {{ claim.id }}
        </SaTableCell>
        <SaTableCell :label="t('pages.claims.status.label')" label-hidden fit>
          <SaTag v-if="claim.enabled" color="green">
            {{ t('pages.claims.enabled') }}
          </SaTag>
          <SaTag v-else color="red">
            {{ t('pages.claims.disabled') }}
          </SaTag>
        </SaTableCell>
        <SaTableCell :label="t('terms.origin.label')" fit>
          <OriginTag :origin="claim.origin" />
        </SaTableCell>
        <SaTableCell :label="t('pages.claims.kind.label')" fit>
          <ClaimKindTag :kind="claim.kind" />
        </SaTableCell>
        <SaTableCell :label="t('pages.claims.tags')" fit>
          <ClaimTags :required="claim.required" :identifier="claim.identifier" />
        </SaTableCell>
        <SaTableCell :label="t('pages.claims.publishedIn.label')" fit>
          <ClaimPublishedInTag :places="claim.published_in" />
        </SaTableCell>
      </tr>
    </template>

    <template #empty>
      <p class="text-sm text-gray-600">{{ t('pages.claims.empty') }}</p>
    </template>
  </CollectionPage>
</template>
