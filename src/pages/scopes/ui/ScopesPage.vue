<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useScopeStore } from '@/entities/scope'
import { CollectionPage, CollectionSortHeader } from '@/shared/collection'
import { EmptyValue, OriginTag, TableCell, TableHeader, Tag } from '@/shared/ui'

const { t } = useI18n()
const scopeStore = useScopeStore()

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
  await scopeStore.scopes.fetch()
})
</script>

<template>
  <CollectionPage :collection="scopeStore.scopes" :search-placeholder="t('pages.scopes.search')">
    <template #header>
      <CollectionSortHeader
        fit
        :collection="scopeStore.scopes"
        :label="t('pages.scopes.status')"
        field="enabled"
      />
      <CollectionSortHeader
        :collection="scopeStore.scopes"
        :label="t('pages.scopes.id')"
        field="scope"
      />
      <CollectionSortHeader
        fit
        :collection="scopeStore.scopes"
        :label="t('pages.scopes.type')"
        field="type"
      />
      <TableHeader fit>{{ t('common.origin.label') }}</TableHeader>
      <TableHeader>{{ t('pages.scopes.claims') }}</TableHeader>
    </template>

    <template #rows>
      <tr v-for="scope in scopeStore.scopes.items" :key="scope.id">
        <TableCell :label="t('pages.scopes.status')" fit>
          <Tag v-if="scope.enabled" color="green">
            {{ t('pages.scopes.enabled') }}
          </Tag>
          <Tag v-else color="red">
            {{ t('pages.scopes.disabled') }}
          </Tag>
        </TableCell>
        <TableCell primary truncate>
          {{ scope.id }}
        </TableCell>
        <TableCell :label="t('pages.scopes.type')" fit>
          <Tag :color="typeColor(scope.type)">
            {{ t(`pages.scopes.${scope.type}`) }}
          </Tag>
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
