<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useScopeStore } from '@/stores/useScopeStore'
import PaginatedTable from '@/components/PaginatedTable.vue'
import FilterBar from '@/components/FilterBar.vue'
import Tag from '@/components/Tag.vue'
import type { FilterConfig } from '@/components/FilterBar.vue'

const { t } = useI18n()
const scopeStore = useScopeStore()

const filters = computed<FilterConfig[]>(() => [
  {
    key: 'type',
    label: t('pages.scopes.typeFilter'),
    type: 'select',
    options: [
      { label: t('pages.scopes.allTypes'), value: '' },
      { label: t('pages.scopes.consentable'), value: 'consentable' },
      { label: t('pages.scopes.grantable'), value: 'grantable' },
      { label: t('pages.scopes.client'), value: 'client' },
    ],
  },
  {
    key: 'enabled',
    label: t('pages.scopes.statusFilter'),
    type: 'select',
    options: [
      { label: t('pages.scopes.allStatuses'), value: '' },
      { label: t('pages.scopes.enabled'), value: 'true' },
      { label: t('pages.scopes.disabled'), value: 'false' },
    ],
  },
])

function onFilterChange(key: string, value: string) {
  if (key === 'type') {
    scopeStore.setTypeFilter(value)
  } else if (key === 'enabled') {
    scopeStore.setEnabledFilter(value)
  }
}

function onFilterRemove(key: string) {
  if (key === 'type') {
    scopeStore.clearTypeFilter()
  } else if (key === 'enabled') {
    scopeStore.clearEnabledFilter()
  }
}

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

function originColor(origin: string): 'blue' | 'gray' | 'yellow' {
  switch (origin) {
    case 'openid':
    case 'oauth2':
      return 'blue'
    case 'custom':
      return 'yellow'
    default:
      return 'gray'
  }
}

onMounted(async () => {
  await scopeStore.fetchScopes()
})
</script>

<template>
  <div>
    <FilterBar
      :filters="filters"
      @filter-change="onFilterChange"
      @filter-remove="onFilterRemove"
    />

    <PaginatedTable
      :loading="scopeStore.loading"
      :error="scopeStore.error"
      :empty="scopeStore.scopes.length === 0"
      :page="scopeStore.page"
      :total-pages="scopeStore.totalPages"
      table-layout="auto"
      @page-change="scopeStore.fetchScopes"
    >
      <template #header>
        <th class="w-0 whitespace-nowrap px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.scopes.status') }}
        </th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.scopes.id') }}
        </th>
        <th class="w-0 whitespace-nowrap px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.scopes.type') }}
        </th>
        <th class="w-0 whitespace-nowrap px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.scopes.origin.label') }}
        </th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.scopes.claims') }}
        </th>
      </template>

      <template #rows>
        <tr v-for="scope in scopeStore.scopes" :key="scope.id">
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <Tag v-if="scope.enabled" color="green">
              {{ t('pages.scopes.enabled') }}
            </Tag>
            <Tag v-else color="red">
              {{ t('pages.scopes.disabled') }}
            </Tag>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {{ scope.id }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <Tag :color="typeColor(scope.type)">
              {{ t(`pages.scopes.${scope.type}`) }}
            </Tag>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <Tag :color="originColor(scope.origin)">
              {{ t(`pages.scopes.origin.${scope.origin}`) }}
            </Tag>
          </td>
          <td class="px-6 py-4 text-sm text-gray-500">
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
    </PaginatedTable>
  </div>
</template>
