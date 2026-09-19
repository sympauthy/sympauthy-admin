<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useScopeStore } from '@/entities/scope'
import { CollectionPage, CollectionSortHeader, Tag, OriginTag } from '@/shared/ui'

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
        class="w-0 whitespace-nowrap"
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
        class="w-0 whitespace-nowrap"
        :collection="scopeStore.scopes"
        :label="t('pages.scopes.type')"
        field="type"
      />
      <th
        class="w-0 whitespace-nowrap px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        {{ t('common.origin.label') }}
      </th>
      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        {{ t('pages.scopes.claims') }}
      </th>
    </template>

    <template #rows>
      <tr v-for="scope in scopeStore.scopes.items" :key="scope.id">
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <Tag v-if="scope.enabled" color="green">
            {{ t('pages.scopes.enabled') }}
          </Tag>
          <Tag v-else color="red">
            {{ t('pages.scopes.disabled') }}
          </Tag>
        </td>
        <td class="px-6 py-4 text-sm font-medium text-gray-900 truncate">
          {{ scope.id }}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <Tag :color="typeColor(scope.type)">
            {{ t(`pages.scopes.${scope.type}`) }}
          </Tag>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <OriginTag :origin="scope.origin" />
        </td>
        <td class="px-6 py-4 text-sm text-gray-500 truncate">
          <span v-if="scope.claims && scope.claims.length > 0">
            {{ scope.claims.join(', ') }}
          </span>
          <span v-else class="text-gray-300">&mdash;</span>
        </td>
      </tr>
    </template>

    <template #empty>
      <p class="text-gray-600">{{ t('pages.scopes.empty') }}</p>
    </template>
  </CollectionPage>
</template>
