<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ScopeApi } from '../api/ScopeApi'
import type { ScopeListResource } from '../model/ScopeListResource'
import type { ScopeResource } from '../model/ScopeResource'
import { CollectionPage, useCollection } from '@/features/browse-collection'
import { SaEmptyValue, SaTableCell, SaTableHeader, SaTag } from '@sympauthy/design'
import { DocHelpTooltip, OriginTag } from '@/shared/ui'

const { t } = useI18n()
const api = new ScopeApi()

const scopes = useCollection<ScopeResource, ScopeListResource>({
  capabilities: () => api.getScopeCapabilities(),
  page: (params) => api.listScopes(params),
  items: (content) => content.scopes,
  key: (scope) => scope.id
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
  await scopes.load()
})
</script>

<template>
  <CollectionPage :collection="scopes" :search-placeholder="t('pages.scopes.search')">
    <template #header>
      <SaTableHeader
        :sorting="scopes.sort"
        field="scope"
        :filtered-label="scopes.filteredLabel('scope')"
      >
        {{ t('pages.scopes.id') }}
      </SaTableHeader>
      <SaTableHeader
        fit
        :sorting="scopes.sort"
        field="type"
        :filtered-label="scopes.filteredLabel('type')"
      >
        {{ t('pages.scopes.type.label') }}
        <template #help>
          <DocHelpTooltip term="pages.scopes.type" />
        </template>
      </SaTableHeader>
      <SaTableHeader fit>
        {{ t('terms.origin.label') }}
        <DocHelpTooltip term="pages.scopes.origin" />
      </SaTableHeader>
      <SaTableHeader>
        {{ t('pages.scopes.claims.label') }}
        <DocHelpTooltip term="pages.scopes.claims" />
      </SaTableHeader>
      <SaTableHeader
        fit
        :sorting="scopes.sort"
        field="enabled"
        :filtered-label="scopes.filteredLabel('enabled')"
      >
        {{ t('pages.scopes.status.label') }}
        <template #help>
          <DocHelpTooltip term="pages.scopes.status" />
        </template>
      </SaTableHeader>
    </template>

    <template #rows>
      <tr v-for="scope in scopes.items" :key="scope.id">
        <SaTableCell primary mono>
          {{ scope.id }}
        </SaTableCell>
        <SaTableCell :label="t('pages.scopes.type.label')" fit>
          <SaTag :color="typeColor(scope.type)">
            {{ t(`pages.scopes.${scope.type}`) }}
          </SaTag>
        </SaTableCell>
        <SaTableCell :label="t('terms.origin.label')" fit>
          <OriginTag :origin="scope.origin" />
        </SaTableCell>
        <SaTableCell :label="t('pages.scopes.claims.label')">
          <div v-if="scope.claims && scope.claims.length > 0" class="flex flex-wrap gap-1">
            <SaTag v-for="claim in scope.claims" :key="claim" color="gray" class="font-mono">
              {{ claim }}
            </SaTag>
          </div>
          <SaEmptyValue v-else />
        </SaTableCell>
        <SaTableCell :label="t('pages.scopes.status.label')" label-hidden fit>
          <SaTag v-if="scope.enabled" color="green">
            {{ t('pages.scopes.enabled') }}
          </SaTag>
          <SaTag v-else color="red">
            {{ t('pages.scopes.disabled') }}
          </SaTag>
        </SaTableCell>
      </tr>
    </template>

    <template #empty>
      <p class="text-sm text-gray-600">{{ t('pages.scopes.empty') }}</p>
    </template>
  </CollectionPage>
</template>
