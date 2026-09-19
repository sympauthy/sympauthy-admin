<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ScopeApi } from '../api/ScopeApi'
import type { ScopeListResource } from '../model/ScopeListResource'
import type { ScopeResource } from '../model/ScopeResource'
import { CollectionPage, CollectionSortHeader, useCollection } from '@/features/browse-collection'
import { EmptyValue, OriginTag, TableCell, TableHeader, CommonTag } from '@/shared/ui'

const { t } = useI18n()
const api = new ScopeApi()

const scopes = useCollection<ScopeResource, ScopeListResource>({
  capabilities: () => api.getScopeCapabilities(),
  page: (params) => api.listScopes(params),
  items: (content) => content.scopes
})

function typeColor(type: string): 'blue' | 'purple' | 'gray' {
  switch (type) {
    case 'consentable':
      return 'blue'
    case 'grantable':
      return 'purple'
    default:
      return 'gray'
  }
}

onMounted(async () => {
  await scopes.fetch()
})
</script>

<template>
  <CollectionPage :collection="scopes" :search-placeholder="t('pages.scopes.search')">
    <template #header>
      <CollectionSortHeader
        fit
        :collection="scopes"
        :label="t('pages.scopes.status')"
        field="enabled"
      />
      <CollectionSortHeader :collection="scopes" :label="t('pages.scopes.id')" field="scope" />
      <CollectionSortHeader fit :collection="scopes" :label="t('pages.scopes.type')" field="type" />
      <TableHeader fit>{{ t('common.origin.label') }}</TableHeader>
      <TableHeader>{{ t('pages.scopes.claims') }}</TableHeader>
    </template>

    <template #rows>
      <tr v-for="scope in scopes.items" :key="scope.id">
        <TableCell :label="t('pages.scopes.status')" fit>
          <CommonTag v-if="scope.enabled" color="green">
            {{ t('pages.scopes.enabled') }}
          </CommonTag>
          <CommonTag v-else color="red">
            {{ t('pages.scopes.disabled') }}
          </CommonTag>
        </TableCell>
        <TableCell primary truncate>
          {{ scope.id }}
        </TableCell>
        <TableCell :label="t('pages.scopes.type')" fit>
          <CommonTag :color="typeColor(scope.type)">
            {{ t(`pages.scopes.${scope.type}`) }}
          </CommonTag>
        </TableCell>
        <TableCell :label="t('common.origin.label')" fit>
          <OriginTag :origin="scope.origin" />
        </TableCell>
        <TableCell :label="t('pages.scopes.claims')" truncate>
          <span v-if="scope.claims && scope.claims.length > 0">
            {{ scope.claims.join(', ') }}
          </span>
          <EmptyValue v-else />
        </TableCell>
      </tr>
    </template>

    <template #empty>
      <p class="text-sm text-gray-600">{{ t('pages.scopes.empty') }}</p>
    </template>
  </CollectionPage>
</template>
